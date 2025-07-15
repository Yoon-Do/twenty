

# PRD: Tính năng Lịch Local và Nền tảng Đồng bộ Hai chiều

**Trạng thái:** Bản nháp
**Người tạo:** Gemini
**Ngày tạo:** 15/07/2025
**Người đánh giá:**

---

## 1. Tổng quan

### 1.1. Giới thiệu

Tài liệu này mô tả các yêu cầu để triển khai tính năng "Lịch Local" trong Twenty. Tính năng này cho phép người dùng tạo, xem, sửa và xóa các sự kiện lịch trực tiếp bên trong ứng dụng Twenty mà không cần kết nối với một nhà cung cấp lịch bên ngoài (như Google Calendar hay Microsoft Calendar).

Quan trọng hơn, việc triển khai này sẽ được thực hiện theo **Hướng 2: Hợp nhất Mô hình Dữ liệu (Unified Data Model Approach)**. Cách tiếp cận này không chỉ cung cấp tính năng Lịch Local mà còn đặt nền móng kiến trúc vững chắc cho việc **đồng bộ hai chiều** với các nhà cung cấp lịch bên ngoài trong tương lai.

### 1.2. Vấn đề cần giải quyết

Hện tại, hệ thống lịch của Twenty hoạt động hoàn toàn dựa trên việc nhập (import) dữ liệu từ các nguồn bên ngoài. Người dùng không có khả năng tạo ra một sự kiện độc lập ngay trên Twenty. Điều này tạo ra một số hạn chế:
- Người dùng không thể ghi lại các cuộc hẹn hoặc công việc nhanh chóng nếu chúng không tồn tại trên lịch Google/Microsoft của họ.
- Twenty bị phụ thuộc vào các dịch vụ bên ngoài cho một chức năng cốt lõi của CRM là quản lý hoạt động.
- Không có cơ sở để xây dựng tính năng đồng bộ ngược lại (từ Twenty ra các lịch bên ngoài).

### 1.3. Mục tiêu

- **Mục tiêu chính:** Cho phép người dùng tạo và quản lý các sự kiện lịch trực tiếp trên Twenty.
- **Mục tiêu kiến trúc:** Sửa đổi mô hình dữ liệu hiện tại để hỗ trợ cả sự kiện được nhập và sự kiện local trong cùng một cấu trúc, tạo nền tảng cho đồng bộ hai chiều.
- **Mục tiêu trải nghiệm người dùng:** Tích hợp liền mạch tính năng mới vào giao diện lịch hiện có, mang lại trải nghiệm thống nhất.

---

## 2. Yêu cầu Chi tiết

### 2.1. Nguyên tắc chỉ đạo

Chúng ta sẽ tuân thủ nghiêm ngặt **Hướng 2: Hợp nhất Mô hình Dữ liệu**. Điều này có nghĩa là chúng ta sẽ sửa đổi `CalendarEvent` entity hiện có thay vì tạo ra một entity mới. Mọi sự kiện, dù được nhập từ Google/Microsoft hay được tạo cục bộ trên Twenty, đều sẽ được lưu trữ trong cùng một bảng cơ sở dữ liệu.

### 2.2. Thay đổi ở Backend (`twenty-server`)

#### 2.2.1. Sửa đổi Schema Cơ sở dữ liệu (Entity `CalendarEvent`)

Đây là thay đổi cốt lõi. Entity `CalendarEvent` (được định nghĩa trong `twenty-orm`) cần được cập nhật như sau:

| Tên trường | Thay đổi | Lý do |
| :--- | :--- | :--- |
| `sourceType` | **Thêm mới.** Kiểu `enum` hoặc `string`. | **Bắt buộc.** Dùng để phân biệt nguồn gốc của sự kiện. Giá trị có thể là: `GOOGLE`, `MICROSOFT`, `TWENTY_LOCAL`. |
| `externalId` | Chuyển thành **`nullable`**. | Sự kiện local sẽ không có ID từ bên ngoài. |
| `syncState` | Chuyển thành **`nullable`**. | Các trường liên quan đến việc đồng bộ (sync token, etc.) không áp dụng cho sự kiện local. |
| `calendarChannelId` | Chuyển thành **`nullable`**. | Sự kiện local không thuộc về một kênh đồng bộ cụ thể. |
| `creatorId` | **Thêm mới.** Foreign key đến `User` entity. | **Bắt buộc.** Để xác định người dùng nào đã tạo ra sự kiện local này. |

#### 2.2.2. Cập nhật Logic Nhập khẩu

- `CalendarEventsImportService` và các driver liên quan (`GoogleCalendarDriver`, `MicrosoftCalendarDriver`) phải được cập nhật.
- Khi một sự kiện được nhập hoặc cập nhật từ Google/Microsoft, service này phải đặt giá trị `sourceType` tương ứng là `GOOGLE` hoặc `MICROSOFT`.

#### 2.2.3. Xây dựng API GraphQL cho Lịch Local

Chúng ta cần tạo các `mutation` mới để quản lý vòng đời của các sự kiện local.

- **`createCalendarEvent(input: CreateCalendarEventInput!): CalendarEvent`**
  - `input` sẽ chứa các trường như `title`, `startsAt`, `endsAt`, `description`, `participantIds`, `targetableObjectId`, v.v.
  - Resolver của mutation này sẽ:
    1.  Kiểm tra quyền của người dùng.
    2.  Tạo một bản ghi `CalendarEvent` mới.
    3.  Đặt `sourceType = 'TWENTY_LOCAL'`.
    4.  Gán `creatorId` là ID của người dùng hiện tại.
    5.  Xử lý việc thêm người tham gia (participants) thông qua `CalendarEventParticipantManagerModule`.

- **`updateCalendarEvent(id: ID!, input: UpdateCalendarEventInput!): CalendarEvent`**
  - Resolver sẽ:
    1.  Tìm `CalendarEvent` theo `id`.
    2.  **Kiểm tra quan trọng:** Chỉ cho phép thực hiện nếu `sourceType` là `TWENTY_LOCAL` (hoặc kiểm tra quyền sở hữu dựa trên `creatorId`).
    3.  Cập nhật các trường được cung cấp trong `input`.

- **`deleteCalendarEvent(id: ID!): Boolean`**
  - Resolver sẽ:
    1.  Tìm `CalendarEvent` theo `id`.
    2.  **Kiểm tra quan trọng:** Tương tự như `update`, chỉ cho phép xóa sự kiện local.
    3.  Thực hiện xóa mềm (soft delete) hoặc xóa cứng tùy theo logic của hệ thống.

#### 2.2.4. Đơn giản hóa Truy vấn hiện có

- Truy vấn `getTimelineCalendarEventsFrom...` sẽ không cần logic hợp nhất phức tạp nữa. Nó chỉ cần truy vấn bảng `CalendarEvent` và lọc theo `targetableObjectId` (person hoặc company).

### 2.3. Thay đổi ở Frontend (`twenty-front`)

#### 2.3.1. Giao diện Người dùng (UI/UX)

- **Nút tạo sự kiện:** Thêm một nút "Tạo sự kiện" (Create Event) ở vị trí nổi bật trên giao diện lịch (`packages/twenty-front/src/modules/activities/calendar/components/Calendar.tsx`).
- **Form/Modal tạo/sửa sự kiện:**
  - Khi nhấn nút "Tạo sự kiện", một modal sẽ hiện ra.
  - Modal này chứa các trường nhập liệu cho: Tiêu đề, Ngày bắt đầu/kết thúc (với time picker), Mô tả, Người tham gia (chọn từ danh sách người dùng/liên hệ), Đối tượng liên quan (công ty/người liên hệ).
  - Form này sẽ được sử dụng cho cả việc tạo mới và chỉnh sửa.

#### 2.3.2. Tích hợp GraphQL

- **Định nghĩa Mutations:** Tạo các file GraphQL mới trong `packages/twenty-front/src/modules/activities/calendar/graphql/mutations/` để định nghĩa các mutation `createCalendarEvent`, `updateCalendarEvent`, `deleteCalendarEvent`.
- **Tích hợp vào Form:**
  - Component Form sẽ sử dụng hook `useMutation` của Apollo Client.
  - Khi người dùng submit form, gọi mutation tương ứng.
  - **Cập nhật cache:** Sau khi mutation thành công, sử dụng cơ chế `refetchQueries` hoặc cập nhật cache của Apollo trực tiếp để giao diện lịch hiển thị ngay lập tức sự kiện mới/đã cập nhật mà không cần tải lại trang.

---

## 3. Rủi ro và Giải pháp

| Rủi ro | Mức độ | Giải pháp |
| :--- | :--- | :--- |
| **Phá vỡ tính năng nhập lịch hiện có** | Cao | - Viết bộ test tích hợp (integration tests) đầy đủ cho luồng nhập từ Google/Microsoft sau khi thay đổi entity. <br> - Thực hiện kiểm thử thủ công (manual testing) kỹ lưỡng trên môi trường staging. |
| **Migration dữ liệu phức tạp** | Trung bình | - Viết một script migration cẩn thận để cập nhật tất cả các bản ghi `CalendarEvent` hiện có, đặt `sourceType` cho chúng. <br> - Backup cơ sở dữ liệu trước khi chạy migration trên môi trường production. |
| **Xử lý quyền truy cập sai** | Trung bình | - Logic kiểm tra quyền phải được viết cẩn thận trong các resolver, đảm bảo người dùng chỉ có thể sửa/xóa các sự kiện họ sở hữu. <br> - Viết unit test cho các kịch bản phân quyền này. |

---

## 4. Kế hoạch Kiểm thử (Testing Plan)

- **Unit Tests:**
  - Test các service và resolver mới cho `create/update/deleteCalendarEvent`.
  - Test logic phân quyền trong resolver.
- **Integration Tests (`twenty-server`):
  - Test toàn bộ luồng API: gọi GraphQL mutation -> resolver -> service -> cơ sở dữ liệu.
  - **Quan trọng:** Chạy lại toàn bộ test cho `calendar-event-import-manager` để đảm bảo không có hồi quy (regression). Lệnh: `npx nx run twenty-server:test:integration:with-db-reset`.
- **E2E Tests (`twenty-e2e-testing`):
  - Viết một kịch bản Playwright mới:
    1.  Đăng nhập.
    2.  Vào trang của một Company.
    3.  Mở tab Lịch.
    4.  Nhấn nút "Tạo sự kiện".
    5.  Điền form và lưu lại.
    6.  Xác minh sự kiện mới xuất hiện trên lịch.
    7.  Chỉnh sửa sự kiện đó.
    8.  Xóa sự kiện đó.

---

## 5. Lộ trình Tương lai (Future Work)

Việc hoàn thành PRD này sẽ mở ra các khả năng sau:

1.  **Đồng bộ hai chiều:** Đây là bước tiếp theo tự nhiên. Một background job có thể được tạo ra để:
    - Tìm các sự kiện có `sourceType = 'TWENTY_LOCAL'` và `externalId = null`.
    - Đẩy chúng lên API của Google/Microsoft.
    - Lưu lại `externalId` và cập nhật `sourceType` thành `SYNCED_GOOGLE` chẳng hạn.
2.  **Tính năng sự kiện lặp lại (Recurring Events):** Có thể thêm logic để hỗ trợ các sự kiện lặp lại cho cả sự kiện local và sự kiện được nhập.
3.  **Gán sự kiện cho nhiều đối tượng:** Mở rộng khả năng liên kết một sự kiện với nhiều Person hoặc Company.

---

## 6. Tài liệu Tham khảo (Code References)

Phân tích và đề xuất trong tài liệu này dựa trên việc xem xét các file và module sau:

- **`packages/twenty-server/src/modules/calendar/`**: Toàn bộ module backend của lịch.
  - `calendar.module.ts`
  - `calendar-event-import-manager/services/calendar-events-import.service.ts`
  - `calendar-event-participant-manager/`
- **`packages/twenty-front/src/modules/activities/calendar/`**: Toàn bộ module frontend của lịch.
  - `components/Calendar.tsx`
  - `hooks/useCalendarEvents.ts`
  - `graphql/queries/getTimelineCalendarEventsFromCompanyId.ts`
- **`packages/twenty-front/src/modules/activities/calendar/types/CalendarEvent.ts`**: Định nghĩa kiểu dữ liệu ở frontend, là một chỉ dẫn tốt cho cấu trúc entity.
- **`GEMINI.md`**: Để tham khảo các lệnh build, test và các nguyên tắc kiến trúc chung của dự án.

```