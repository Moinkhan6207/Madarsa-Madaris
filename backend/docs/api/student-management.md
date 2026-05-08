# Student Management API

## Module Scope
Module 3 implements the backend core domain for tenant-scoped student management with strict lifecycle control, soft delete, history tracking, guardian management, and sponsor mapping.

## Architecture Notes
- Pattern: MVC + Service + Repository
- Tenant safety: every read/write is filtered by `tenantId` and rejects cross-tenant branch, session, sponsor, guardian, and student access
- Lifecycle safety: direct status updates are blocked outside `PATCH /api/v1/tenant/students/:id/status`
- Auditability: every create, update, status change, guardian change, sponsor change, and soft delete writes `StudentHistory` and `AuditLog`
- Soft delete: `Student`, `StudentGuardian`, `Sponsor`, and `StudentSponsor` use `deletedAt`
- Performance: indexed tenant-scoped search on `fullName`, `admissionNumber`, guardian phone, status, branch, and boolean flags

## Lifecycle Flow
`LEAD -> APPLIED -> UNDER_REVIEW -> ADMITTED -> ACTIVE -> PROMOTED -> PASSED_OUT -> ALUMNI`

Also supported:
- `APPLIED -> DROPPED`
- `UNDER_REVIEW -> DROPPED`
- `ADMITTED -> DROPPED`
- `ACTIVE -> TRANSFERRED`
- `ACTIVE -> DROPPED`
- `PROMOTED -> ACTIVE`
- `PROMOTED -> TRANSFERRED`
- `PROMOTED -> DROPPED`
- `TRANSFERRED -> ALUMNI`
- `DROPPED -> ALUMNI`
- `PASSED_OUT -> ALUMNI`

Invalid examples:
- `LEAD -> ACTIVE`
- `PROMOTED -> LEAD`
- any direct `PUT /students/:id` status mutation

## Endpoints

### `POST /api/v1/tenant/students`
Creates a student in `LEAD` state, auto-generates a tenant-unique admission number, and optionally creates guardians and sponsor mappings in one transaction.

Example request:
```json
{
  "branchId": "0c0d8d4d-0d3c-4744-a11f-2fe817f44fe0",
  "academicSessionId": "971e9b59-b1aa-4718-bdbe-4b47f6562ab4",
  "firstName": "Abdullah",
  "lastName": "Khan",
  "phone": "9876543210",
  "isOrphan": false,
  "isNeedy": true,
  "currentProgram": "Hifz",
  "currentClass": "Year 1",
  "guardians": [
    {
      "relation": "FATHER",
      "fullName": "Mohammad Khan",
      "phone": "9123456789",
      "isPrimary": true
    }
  ],
  "sponsorMappings": [
    {
      "sponsorId": "564940d0-ec95-448b-8da0-bce1487ddf34",
      "supportLabel": "Monthly hostel support",
      "amount": 2500
    }
  ]
}
```

### `GET /api/v1/tenant/students`
Supports:
- `page`, `limit`
- `search`
- `branchId`
- `status`
- `orphan`
- `sponsored`
- `needy`
- `sortBy`: `createdAt | updatedAt | fullName | admissionNumber | status | admissionDate`
- `sortOrder`: `asc | desc`

Example:
`GET /api/v1/tenant/students?search=abd&status=ACTIVE&branchId=...&sponsored=true&page=1&limit=20`

### `GET /api/v1/tenant/students/:id`
Returns:
- student profile
- branch
- academic session
- guardians
- sponsors
- history

### `PUT /api/v1/tenant/students/:id`
Updates profile, branch, session, class/program, and optional sponsor mappings.

Important:
- cannot update `status`
- branch and sponsor ownership are validated against the tenant
- all changed fields are recorded in history

### `PATCH /api/v1/tenant/students/:id/status`
Strict lifecycle transition endpoint.

Example request:
```json
{
  "status": "APPLIED",
  "notes": "Application form reviewed and accepted"
}
```

### `DELETE /api/v1/tenant/students/:id`
Soft deletes the student and records audit history.

### `POST /api/v1/tenant/students/:id/guardians`
Adds a guardian. If the payload sets `isPrimary=true`, existing primary guardians for the student are demoted.

### `PUT /api/v1/tenant/guardians/:id`
Updates a guardian with tenant safety and primary-guardian enforcement.

### `DELETE /api/v1/tenant/guardians/:id`
Soft deletes a guardian.

### `POST /api/v1/tenant/sponsors`
Creates a reusable sponsor record inside the tenant.

Example request:
```json
{
  "name": "Helping Hands Trust",
  "phone": "9000000000",
  "email": "support@helpinghands.org",
  "organization": "Helping Hands Trust"
}
```

### `POST /api/v1/tenant/students/:id/sponsors`
Links an existing sponsor to a student.

### `DELETE /api/v1/tenant/students/:id/sponsors/:sponsorId`
Soft unlinks the sponsor from the student and recalculates `isSponsored`.

## Permissions
- `student.create`
- `student.view`
- `student.update`
- `student.delete`
- `student.status.update`
- `student.guardian.manage`
- `student.sponsor.manage`

## Response Shape
All endpoints use the existing API envelope:
```json
{
  "success": true,
  "data": {}
}
```

Validation and business-rule failures use the standard error envelope with module-specific error codes such as:
- `STUDENT_NOT_FOUND`
- `INVALID_STUDENT_STATUS_TRANSITION`
- `DIRECT_STUDENT_STATUS_UPDATE_FORBIDDEN`
- `SPONSOR_NOT_FOUND`
- `MULTIPLE_PRIMARY_GUARDIANS`
