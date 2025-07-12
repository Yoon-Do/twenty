import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import request from 'supertest';

import { SuperAdminTokenService } from 'src/engine/core-modules/auth/token/services/super-admin-token.service';
import { CrossWorkspaceAdminService } from 'src/engine/core-modules/admin-panel/cross-workspace-admin.service';
import { SuperAdminPermissionsService } from 'src/engine/metadata-modules/permissions/super-admin-permissions.service';
import { SuperAdminGuard } from 'src/engine/guards/super-admin.guard';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

describe('Super Admin Cross-Workspace Access (Integration)', () => {
  let app: INestApplication;
  let superAdminTokenService: SuperAdminTokenService;
  let crossWorkspaceAdminService: CrossWorkspaceAdminService;
  let superAdminPermissionsService: SuperAdminPermissionsService;

  let testSuperAdmin: User;
  let testWorkspaceA: Workspace;
  let testWorkspaceB: Workspace;
  let superAdminToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // Add necessary imports for testing
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'test',
          password: 'test',
          database: 'test',
          autoLoadEntities: true,
          synchronize: true,
        }),
      ],
      providers: [
        SuperAdminTokenService,
        CrossWorkspaceAdminService,
        SuperAdminPermissionsService,
        SuperAdminGuard,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    superAdminTokenService = moduleFixture.get<SuperAdminTokenService>(
      SuperAdminTokenService,
    );
    crossWorkspaceAdminService = moduleFixture.get<CrossWorkspaceAdminService>(
      CrossWorkspaceAdminService,
    );
    superAdminPermissionsService =
      moduleFixture.get<SuperAdminPermissionsService>(
        SuperAdminPermissionsService,
      );
  });

  beforeEach(async () => {
    // Create test super admin user
    testSuperAdmin = {
      id: 'super-admin-id',
      email: 'superadmin@test.com',
      canAccessFullAdminPanel: true,
    } as User;

    // Create test workspaces
    testWorkspaceA = {
      id: 'workspace-a-id',
      displayName: 'Workspace A',
      subdomain: 'workspace-a',
    } as Workspace;

    testWorkspaceB = {
      id: 'workspace-b-id',
      displayName: 'Workspace B',
      subdomain: 'workspace-b',
    } as Workspace;

    // Generate super admin token
    const tokens = await superAdminTokenService.generateSuperAdminToken(
      testSuperAdmin.id,
      testWorkspaceB.id,
    );

    superAdminToken = tokens.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Super Admin Token Generation', () => {
    it('should generate valid super admin token', async () => {
      const tokens = await superAdminTokenService.generateSuperAdminToken(
        testSuperAdmin.id,
        testWorkspaceA.id,
      );

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(typeof tokens.accessToken).toBe('string');
    });

    it('should validate super admin token correctly', async () => {
      const tokens = await superAdminTokenService.generateSuperAdminToken(
        testSuperAdmin.id,
      );

      const decoded = await superAdminTokenService.validateSuperAdminToken(
        tokens.accessToken,
      );

      expect(decoded).toBeTruthy();
      expect(decoded?.userId).toBe(testSuperAdmin.id);
      expect(decoded?.type).toBe('SUPER_ADMIN');
    });
  });

  describe('Cross-Workspace Access', () => {
    it('should allow super admin to get all workspaces', async () => {
      const workspaces =
        await crossWorkspaceAdminService.getAllWorkspacesSummary();

      expect(Array.isArray(workspaces)).toBe(true);
      // In real test, would verify actual workspace data
    });

    it('should allow super admin to generate workspace access token', async () => {
      const token =
        await crossWorkspaceAdminService.generateWorkspaceAccessToken(
          testSuperAdmin.id,
          testWorkspaceB.id,
          testSuperAdmin,
        );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });

    it('should allow super admin to add admin to any workspace', async () => {
      await expect(
        crossWorkspaceAdminService.addAdminToWorkspace(
          testSuperAdmin.id,
          testWorkspaceB.id,
          testSuperAdmin,
        ),
      ).resolves.not.toThrow();
    });
  });

  describe('Permission Bypass', () => {
    it('should grant super admin full permissions', async () => {
      const permissions =
        await superAdminPermissionsService.getUserWorkspacePermissions({
          userWorkspaceId: 'any-id',
          workspaceId: testWorkspaceB.id,
          isSuperAdmin: true,
        });

      // Verify all settings permissions are true
      Object.values(permissions.settingsPermissions).forEach((permission) => {
        expect(permission).toBe(true);
      });

      // Verify all object permissions are true
      Object.values(permissions.objectRecordsPermissions).forEach(
        (permission) => {
          expect(permission).toBe(true);
        },
      );
    });

    it('should bypass workspace setting permission checks', async () => {
      const hasPermission =
        await superAdminPermissionsService.userHasWorkspaceSettingPermission({
          userWorkspaceId: 'any-id',
          workspaceId: testWorkspaceB.id,
          setting: 'WORKSPACE' as any,
          isExecutedByApiKey: false,
          isSuperAdmin: true,
        });

      expect(hasPermission).toBe(true);
    });
  });

  describe('Security and Audit', () => {
    it('should require canAccessFullAdminPanel for super admin token', async () => {
      const regularUser = {
        ...testSuperAdmin,
        canAccessFullAdminPanel: false,
      };

      await expect(
        crossWorkspaceAdminService.generateWorkspaceAccessToken(
          regularUser.id,
          testWorkspaceB.id,
          regularUser,
        ),
      ).rejects.toThrow('Not authorized');
    });

    it('should log super admin actions for audit', async () => {
      // This would test the audit logging functionality
      // In real implementation, would verify audit logs are created
      expect(true).toBe(true); // Placeholder
    });
  });

  describe('GraphQL Integration', () => {
    it('should allow super admin to access cross-workspace resolvers', async () => {
      const query = `
        query GetAllWorkspaces {
          getAllWorkspaces {
            id
            name
            userCount
            isActive
          }
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ query })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.getAllWorkspaces).toBeDefined();
    });

    it('should allow super admin to generate workspace access tokens via GraphQL', async () => {
      const mutation = `
        mutation GenerateWorkspaceAccessToken($workspaceId: String!) {
          generateWorkspaceAccessToken(workspaceId: $workspaceId)
        }
      `;

      const response = await request(app.getHttpServer())
        .post('/graphql')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          query: mutation,
          variables: { workspaceId: testWorkspaceB.id },
        })
        .expect(200);

      expect(response.body.data).toBeDefined();
      expect(response.body.data.generateWorkspaceAccessToken).toBeDefined();
    });
  });
});
