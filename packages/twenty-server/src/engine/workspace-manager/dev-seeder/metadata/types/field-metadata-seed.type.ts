import { CreateFieldInput } from 'src/engine/metadata-modules/field-metadata/dtos/create-field.input';

export type FieldMetadataSeed = Omit<
  CreateFieldInput,
  'objectMetadataId' | 'workspaceId'
> & {
  /**
   * Optional nameSingular of the target object when seeding relation fields.
   * If provided, it will be resolved to the actual targetObjectMetadataId at
   * seed time.
   */
  targetObjectNameSingular?: string;
};
