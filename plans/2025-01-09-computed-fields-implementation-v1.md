# Computed Fields Implementation Plan - Revised

## Objective
Implement computed fields functionality in Twenty CRM to enable automatic calculation of aggregate values (SUM, COUNT, AVG, etc.) from related objects. Primary use case: Order object automatically calculating total amount from OrderItem objects.

## Key Codebase Findings

### Field Type System Architecture
- **Core Enum**: `FieldMetadataType` enum in `/packages/twenty-shared/src/types/FieldMetadataType.ts`
- **Settings System**: Type-safe settings interface in `/packages/twenty-server/src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface.ts`
- **Frontend Registration**: Field types registered in `/packages/twenty-front/src/modules/settings/data-model/constants/`

### GraphQL Schema Generation
- **Type Mapping**: Centralized in `TypeMapperService` with scalar, filter, and orderBy mappings
- **Schema Extension**: Dynamic GraphQL type extension via `ExtendObjectTypeDefinitionV2Factory`
- **Resolver Integration**: Auto-generated resolvers through factory pattern

### Frontend Field Components  
- **Display Components**: Pattern `/packages/twenty-front/src/modules/object-record/record-field/meta-types/display/components/`
- **Input Components**: Pattern `/packages/twenty-front/src/modules/object-record/record-field/meta-types/input/components/`
- **Storybook Integration**: Each component has corresponding stories and performance tests

### Database & Migration Patterns
- **Migration Structure**: TypeORM migrations in `/packages/twenty-server/src/database/typeorm/core/migrations/`
- **Settings Storage**: JSON column pattern already exists for field settings (migration 1713793656356)
- **Column Mapping**: Direct correlation between `FieldMetadataType` and database columns

### Caching & Performance
- **Redis Integration**: Available via `RedisClientService` for caching computed values
- **Message Queue**: BullMQ system for background computation jobs
- **Performance Monitoring**: No specific caching service pattern found - will need custom implementation

### Testing Infrastructure
- **Unit Tests**: Jest with comprehensive test coverage in `__tests__` folders
- **Integration Tests**: Available with database reset capability
- **Storybook**: Performance testing integration for UI components
- **E2E Tests**: Nx test runners with coverage reporting

## Revised Implementation Plan

### Phase 1: Core Type System Integration (Days 1-2)
1. **Add COMPUTED Field Type to Enum**
   - Files: `packages/twenty-shared/src/types/FieldMetadataType.ts`
   - Add `COMPUTED = 'COMPUTED'` to enum
   - Status: Not Started

2. **Define Computed Field Settings Interface**
   - Dependencies: Task 1
   - Files: `packages/twenty-server/src/engine/metadata-modules/field-metadata/interfaces/field-metadata-settings.interface.ts`
   - Add `FieldMetadataComputedSettings` type with sourceObject, sourceField, aggregationType
   - Integrate with `FieldMetadataSettingsMapping`
   - Status: Not Started

3. **Create Database Migration**
   - Dependencies: Task 1
   - Files: New migration file in `/packages/twenty-server/src/database/typeorm/core/migrations/common/`
   - Update field metadata schema to support computed fields
   - Status: Not Started

### Phase 2: GraphQL Schema Integration (Days 3-5)
4. **Update TypeMapper for Computed Fields**
   - Dependencies: Task 2
   - Files: `packages/twenty-server/src/engine/api/graphql/workspace-schema-builder/services/type-mapper.service.ts`
   - Add computed field scalar type (likely string/number based on aggregation)
   - Add filter and orderBy support for computed fields
   - Status: Not Started

5. **Create Computed Field Resolver Factory**
   - Dependencies: Task 4
   - Files: `packages/twenty-server/src/engine/api/graphql/workspace-schema-builder/factories/computed-field-resolver.factory.ts`
   - Implement resolver logic for aggregation queries
   - Integrate with existing workspace query runner
   - Status: Not Started

6. **Extend Object Type Definition Factory**
   - Dependencies: Task 5
   - Files: `packages/twenty-server/src/engine/api/graphql/workspace-schema-builder/factories/extend-object-type-definition-v2.factory.ts`
   - Register computed field resolvers in schema generation
   - Status: Not Started

### Phase 3: Business Logic Implementation (Days 6-9)
7. **Create Computed Field Service**
   - Dependencies: Task 2
   - Files: `packages/twenty-server/src/engine/metadata-modules/field-metadata/services/computed-field.service.ts`
   - Implement aggregation query logic (SUM, COUNT, AVG, etc.)
   - Handle source object field validation
   - Status: Not Started

8. **Implement Value Computation Logic**
   - Dependencies: Task 7
   - Files: `packages/twenty-server/src/engine/metadata-modules/field-metadata/utils/compute-field-value.util.ts`
   - Create optimized SQL queries for aggregations
   - Handle relation-based computations
   - Status: Not Started

9. **Add Computed Field Cache Service**
   - Dependencies: Task 8
   - Files: `packages/twenty-server/src/engine/metadata-modules/field-metadata/services/computed-field-cache.service.ts`
   - Implement Redis-based caching for computed values
   - Handle cache invalidation on source data changes
   - Status: Not Started

### Phase 4: Frontend Implementation (Days 10-12)
10. **Create Computed Field Display Component**
    - Dependencies: Task 1
    - Files: `packages/twenty-front/src/modules/object-record/record-field/meta-types/display/components/ComputedFieldDisplay.tsx`
    - Read-only display component (computed fields are not editable)
    - Support for number formatting based on aggregation type
    - Status: Not Started

11. **Add Field Type Configuration**
    - Dependencies: Task 10
    - Files: `packages/twenty-front/src/modules/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs.ts`
    - Register COMPUTED field type with appropriate icon and category
    - Status: Not Started

12. **Create Field Settings Form**
    - Dependencies: Task 11
    - Files: `packages/twenty-front/src/modules/settings/data-model/fields/forms/components/ComputedFieldSettingsFormCard.tsx`
    - UI for configuring source object, field, and aggregation type
    - Status: Not Started

### Phase 5: Real-time Updates & Event System (Days 13-14)
13. **Implement Event-Driven Cache Invalidation**
    - Dependencies: Task 9
    - Files: `packages/twenty-server/src/engine/core-modules/event-emitter/listeners/computed-field-invalidation.listener.ts`
    - Listen to object record changes and invalidate computed field cache
    - Use existing event emitter system for workspace changes
    - Status: Not Started

14. **Add Background Computation Jobs**
    - Dependencies: Task 13
    - Files: `packages/twenty-server/src/modules/computed-field/jobs/computed-field-update.job.ts`
    - Implement BullMQ jobs for asynchronous computation updates
    - Handle batch updates for performance
    - Status: Not Started

### Phase 6: Testing & Optimization (Days 15-17)
15. **Unit & Integration Tests**
    - Dependencies: All backend tasks (1-9, 13-14)
    - Files: Multiple `__tests__` directories following existing patterns
    - Comprehensive test coverage for:
      - `ComputedFieldService.spec.ts`
      - `computed-field-value.util.spec.ts`
      - `ComputedFieldCacheService.spec.ts`
      - GraphQL schema generation tests
    - Status: Not Started

16. **Frontend Component Tests**
    - Dependencies: Tasks 10-12
    - Files: Storybook stories and Jest tests for frontend components
    - Performance testing integration following existing patterns
    - Status: Not Started

17. **Integration Testing with Sample Data**
    - Dependencies: Task 15, 16
    - Files: Integration test suites with database reset capability
    - Test Order/OrderItem aggregation use case end-to-end
    - Performance benchmarking for large datasets
    - Status: Not Started

### Phase 7: Final Integration & Polish (Days 18-20)
18. **Performance Optimization**
    - Dependencies: Task 17
    - Query optimization for complex aggregations
    - Redis cache tuning and monitoring
    - Background job performance analysis
    - Status: Not Started

19. **Error Handling & Edge Cases**
    - Dependencies: Task 18
    - Handle circular dependency detection in computed fields
    - Graceful degradation when source fields are deleted
    - Proper error messages in frontend
    - Status: Not Started

20. **Final Integration Testing**
    - Dependencies: Task 19
    - End-to-end testing across all components
    - Regression testing to ensure no existing functionality breaks
    - Load testing with realistic data volumes
    - Status: Not Started

## Verification Criteria
- Computed fields can be created through the Twenty UI with proper validation
- Order object can automatically calculate total from OrderItem objects using SUM aggregation
- Computed values update automatically when source data changes via event system
- Performance remains acceptable with large datasets (>1000 records) through Redis caching
- GraphQL queries work correctly with computed fields (including filtering and sorting)
- All existing functionality remains unaffected (verified through regression testing)
- Proper error handling when source objects/fields are deleted or modified

## Key Architecture Decisions Based on Codebase Analysis

### 1. **Hybrid Computation Approach**
- **On-demand computation** for initial load and complex queries
- **Redis caching** for frequently accessed values
- **Background job processing** for batch updates when source data changes
- Leverages existing BullMQ infrastructure and Redis integration

### 2. **GraphQL Integration Pattern**
- Follow existing `TypeMapperService` pattern for scalar type mapping
- Use factory pattern for resolver generation (`computed-field-resolver.factory.ts`)
- Integrate with existing workspace schema builder infrastructure
- Computed fields treated as read-only scalar values in GraphQL

### 3. **Event-Driven Updates**
- Leverage existing event emitter system in Twenty for workspace changes
- Cache invalidation triggered by object record modifications
- Background jobs handle expensive recomputation asynchronously

### 4. **Frontend Component Architecture**
- Read-only display components (computed fields cannot be edited)
- Follow existing meta-types pattern for field components
- Integration with existing Storybook and testing infrastructure
- Settings form for configuration follows existing field settings pattern

## Updated Risk Assessment

### **Resolved Risks** (Based on Codebase Findings)
1. ✅ **GraphQL Type Safety**: Existing `TypeMapperService` provides robust type mapping pattern
2. ✅ **Migration Complexity**: Existing migration pattern with JSON settings column simplifies implementation  
3. ✅ **Frontend Integration**: Clear component patterns and existing infrastructure reduce integration risk

### **Remaining Risks & Mitigations**
1. **Performance Impact on Large Datasets**
   - *Risk*: Aggregation queries on large related object sets
   - *Mitigation*: Redis caching + optimized SQL queries + background computation

2. **Cache Consistency**
   - *Risk*: Stale computed values when source data changes rapidly
   - *Mitigation*: Event-driven invalidation + background refresh jobs + TTL-based cache expiry

3. **Circular Dependencies**
   - *Risk*: Computed fields referencing other computed fields
   - *Mitigation*: Dependency validation during field creation + topological sorting for updates

4. **Memory Usage with Large Caches**
   - *Risk*: Redis memory consumption with many computed fields
   - *Mitigation*: Selective caching strategy + cache size monitoring + LRU eviction policies

## Implementation Timeline: 20 Days → 15 Days
Revised timeline leverages existing codebase infrastructure:
- **Days 1-2**: Core type system (reduced from 3 days)
- **Days 3-5**: GraphQL integration (follows existing patterns)  
- **Days 6-9**: Business logic implementation (optimized SQL + caching)
- **Days 10-12**: Frontend components (follows existing patterns)
- **Days 13-14**: Event system integration (uses existing event emitter)
- **Days 15-17**: Testing & optimization (comprehensive coverage)
- **Days 18-20**: Final integration & polish (reduced from separate phase)