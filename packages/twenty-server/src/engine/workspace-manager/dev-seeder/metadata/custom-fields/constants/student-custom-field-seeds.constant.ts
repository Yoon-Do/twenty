import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataSeed } from 'src/engine/workspace-manager/dev-seeder/metadata/types/field-metadata-seed.type';

export const STUDENT_CUSTOM_FIELD_SEEDS: FieldMetadataSeed[] = [
  { type: FieldMetadataType.TEXT, label: 'Student ID', name: 'studentId' },
  { type: FieldMetadataType.FULL_NAME, label: 'Full Name', name: 'fullName' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Gender',
    name: 'gender',
    options: [
      { label: 'Male', value: 'MALE', position: 0, color: 'blue' },
      { label: 'Female', value: 'FEMALE', position: 1, color: 'pink' },
      { label: 'Other', value: 'OTHER', position: 2, color: 'gray' },
    ],
  },
  { type: FieldMetadataType.DATE, label: 'Birthdate', name: 'birthdate' },
  {
    type: FieldMetadataType.PHONES,
    label: 'Phone Number',
    name: 'phoneNumber',
  },
  { type: FieldMetadataType.EMAILS, label: 'Email', name: 'email' },
  { type: FieldMetadataType.ADDRESS, label: 'Address', name: 'address' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Current Level',
    name: 'currentLevel',
    options: [
      { label: 'Beginner', value: 'BEGINNER', position: 0, color: 'blue' },
      {
        label: 'Intermediate',
        value: 'INTERMEDIATE',
        position: 1,
        color: 'yellow',
      },
      { label: 'Advanced', value: 'ADVANCED', position: 2, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.DATE,
    label: 'First Enrollment Date',
    name: 'firstEnrollmentDate',
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Learning Goals',
    name: 'learningGoals',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Learning Mode',
    name: 'learningMode',
    options: [
      { label: 'Online', value: 'ONLINE', position: 0, color: 'blue' },
      { label: 'Offline', value: 'OFFLINE', position: 1, color: 'green' },
    ],
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Learning Status',
    name: 'learningStatus',
    options: [
      { label: 'Active', value: 'ACTIVE', position: 0, color: 'green' },
      { label: 'Paused', value: 'PAUSED', position: 1, color: 'yellow' },
      { label: 'Completed', value: 'COMPLETED', position: 2, color: 'blue' },
    ],
  },
  { type: FieldMetadataType.TEXT, label: 'Description', name: 'description' },
  {
    type: FieldMetadataType.MULTI_SELECT,
    label: 'Tags',
    name: 'tags',
    options: [
      { label: 'VIP', value: 'VIP', position: 0, color: 'red' },
      {
        label: 'Scholarship',
        value: 'SCHOLARSHIP',
        position: 1,
        color: 'blue',
      },
    ],
  },
  {
    type: FieldMetadataType.TEXT,
    label: 'Parent Full Name',
    name: 'parentFullName',
  },
  {
    type: FieldMetadataType.PHONES,
    label: 'Parent Phone Number',
    name: 'parentPhoneNumber',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Enrolled Program',
    name: 'enrolledProgram',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Enrolled Class',
    name: 'enrolledClass',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Assigned Teacher',
    name: 'assignedTeacher',
  },
  {
    type: FieldMetadataType.DATE,
    label: 'Class Enrollment Date',
    name: 'classEnrollmentDate',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Tuition Order',
    name: 'tuitionOrder',
  },
  {
    type: FieldMetadataType.SELECT,
    label: 'Payment History',
    name: 'paymentHistory',
  },
  { type: FieldMetadataType.SELECT, label: 'Gradebook', name: 'gradebook' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Attendance Record',
    name: 'attendanceRecord',
  },
  { type: FieldMetadataType.SELECT, label: 'Appointment', name: 'appointment' },
  {
    type: FieldMetadataType.SELECT,
    label: 'Converted From Lead',
    name: 'convertedFromLead',
  },
  { type: FieldMetadataType.SELECT, label: 'Người tạo', name: 'creator' },
  { type: FieldMetadataType.DATE_TIME, label: 'Ngày tạo', name: 'dateCreated' },
  {
    type: FieldMetadataType.DATE_TIME,
    label: 'Ngày cập nhật gần nhất',
    name: 'lastUpdated',
  },
  {
    type: FieldMetadataType.BOOLEAN,
    label: 'Trạng thái hoạt động',
    name: 'isActive',
  },
];
