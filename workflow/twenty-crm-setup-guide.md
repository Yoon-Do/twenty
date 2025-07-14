# Twenty CRM - Hướng dẫn Setup từ đầu đến cuối

## ⚡ Quick Start (Cho người vội)

```bash
# 1. Cài đặt Docker và Node.js (nếu chưa có)
# 2. Clone repo
git clone https://github.com/Yoon-Do/twenty.git
cd twenty

# 3. Cài đặt dependencies
yarn install

# 4. Khởi động services
make postgres-on-docker redis-on-docker

# 5. Setup database
npx nx run twenty-server:database:reset

# 6. Khởi động app
yarn start

# 7. Truy cập http://localhost:3001
# Đăng nhập: nam.do@salegon.com / Salegon@123
```

## 📋 Mục lục
1. [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
2. [Cài đặt dependencies](#cài-đặt-dependencies)
3. [Setup database](#setup-database)
4. [Clone và cấu hình project](#clone-và-cấu-hình-project)
5. [Khởi động hệ thống](#khởi-động-hệ-thống)
6. [Thông tin đăng nhập](#thông-tin-đăng-nhập)
7. [Troubleshooting](#troubleshooting)

## 🔧 Yêu cầu hệ thống

### Phần mềm cần thiết:
- **Node.js**: v18.17.0 hoặc cao hơn
- **Yarn**: v1.22.0 hoặc cao hơn
- **Docker**: Phiên bản mới nhất (để chạy PostgreSQL, Redis)
- **Git**: Phiên bản mới nhất
- **Make**: Có sẵn trên macOS/Linux

### Kiểm tra phiên bản:
```bash
node --version    # >= v18.17.0
yarn --version    # >= v1.22.0
docker --version  # Docker version 20.x.x+
git --version
make --version
```

## 📦 Cài đặt dependencies

### 1. Cài đặt Node.js và Yarn
```bash
# Cài đặt Node.js (sử dụng nvm - khuyến nghị)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18.17.0
nvm use 18.17.0

# Cài đặt Yarn
npm install -g yarn
```

### 2. Cài đặt Docker

#### macOS:
```bash
# Tải và cài đặt Docker Desktop từ: https://www.docker.com/products/docker-desktop
# Hoặc sử dụng Homebrew:
brew install --cask docker
```

#### Ubuntu/Debian:
```bash
# Cài đặt Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Thêm user vào docker group
sudo usermod -aG docker $USER
newgrp docker

# Khởi động Docker
sudo systemctl start docker
sudo systemctl enable docker
```

## 🗄️ Setup database và services

**Lưu ý quan trọng**: Twenty CRM sử dụng Makefile để tự động setup tất cả services cần thiết qua Docker. Bạn KHÔNG cần cài đặt PostgreSQL, Redis thủ công.

### Services sẽ được tự động setup:
- **PostgreSQL 16**: Database chính (Port: 5432)
- **Redis**: Cache và session storage (Port: 6379)
- **ClickHouse**: Analytics database (Ports: 8123, 9000) - tùy chọn
- **Grafana**: Monitoring dashboard (Port: 4000) - tùy chọn
- **OpenTelemetry**: Tracing collector (Ports: 4317, 4318, 13133) - tùy chọn

### Ports được sử dụng:
| Service | Port | Mô tả |
|---------|------|-------|
| Twenty Frontend | 3001 | Giao diện người dùng |
| Twenty Backend | 3000 | API Server |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| ClickHouse HTTP | 8123 | Analytics DB HTTP |
| ClickHouse Native | 9000 | Analytics DB Native |
| Grafana | 4000 | Monitoring Dashboard |
| OTLP gRPC | 4317 | Tracing gRPC |
| OTLP HTTP | 4318 | Tracing HTTP |

## 📁 Clone và cấu hình project

### 1. Clone repository
```bash
git clone https://github.com/Yoon-Do/twenty.git
cd twenty
```

### 2. Cài đặt dependencies
```bash
yarn install
```

### 3. Cấu hình environment variables
```bash
# Copy file .env mẫu
cp .env.example .env

# Chỉnh sửa file .env với thông tin database
nano .env
```

### 4. Cấu hình .env cơ bản
```env
# Database (sử dụng Docker containers từ Makefile)
PG_DATABASE_URL=postgres://postgres:postgres@localhost:5432/default

# Server
SERVER_URL=http://localhost:3000
FRONT_BASE_URL=http://localhost:3001

# Security
ACCESS_TOKEN_SECRET=your-access-token-secret
LOGIN_TOKEN_SECRET=your-login-token-secret
REFRESH_TOKEN_SECRET=your-refresh-token-secret
FILE_TOKEN_SECRET=your-file-token-secret

# Email (tùy chọn - để trống nếu không dùng)
EMAIL_FROM_ADDRESS=
EMAIL_FROM_NAME=Twenty

# Storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=.local-storage
```

## 🚀 Khởi động hệ thống

### 1. Setup và khởi động services với Makefile
```bash
# Khởi động PostgreSQL container
make postgres-on-docker

# Khởi động Redis container (tùy chọn nhưng khuyến nghị)
make redis-on-docker

# Hoặc khởi động tất cả services cùng lúc:
make postgres-on-docker redis-on-docker

# Kiểm tra containers đang chạy
docker ps
```

**Lưu ý**: Makefile sẽ tự động:
- Tạo Docker network `twenty_network`
- Khởi động PostgreSQL 16 trên port 5432
- Tạo databases `default` và `test`
- Khởi động Redis trên port 6379
- Cấu hình user `postgres` với password `postgres`

### 2. Khởi tạo và seed database
```bash
# Reset database và seed data
npx nx run twenty-server:database:reset

# Đợi cho đến khi thấy thông báo hoàn thành
```

### 3. Khởi động ứng dụng
```bash
# Khởi động frontend và backend
yarn start

# Đợi cho đến khi thấy:
# - Frontend: http://localhost:3001/
# - Backend: Nest application successfully started
```

## 🔑 Thông tin đăng nhập

### Admin Users (có quyền Impersonation)
Hệ thống đã được cấu hình sẵn 4 admin users với đầy đủ quyền:

| Email | Mật khẩu | Quyền |
|-------|----------|-------|
| nam.do@salegon.com | Salegon@123 | Full Admin + Impersonation |
| duc.pham@salegon.com | Salegon@123 | Full Admin + Impersonation |
| lap.le@salegon.com | Salegon@123 | Full Admin + Impersonation |
| thinh.nguyen@salegon.com | Salegon@123 | Full Admin + Impersonation |

### Truy cập ứng dụng
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **GraphQL Playground**: http://localhost:3000/graphql

## 🔧 Troubleshooting

### Lỗi thường gặp và cách khắc phục

#### 1. Lỗi kết nối database
```bash
# Kiểm tra Docker containers đang chạy
docker ps

# Kiểm tra logs PostgreSQL container
docker logs twenty_pg

# Khởi động lại PostgreSQL container
docker restart twenty_pg

# Kiểm tra kết nối database
docker exec -it twenty_pg psql -U postgres -d default

# Nếu container không tồn tại, tạo lại
docker rm -f twenty_pg
make postgres-on-docker
```

#### 2. Lỗi port đã được sử dụng
```bash
# Kiểm tra process đang sử dụng port
lsof -i :3000
lsof -i :3001

# Kill process nếu cần
kill -9 <PID>
```

#### 3. Lỗi yarn install
```bash
# Xóa cache và reinstall
rm -rf node_modules
rm yarn.lock
yarn cache clean
yarn install
```

#### 4. Lỗi TypeScript
```bash
# Build lại project
yarn build

# Hoặc reset hoàn toàn
make clean
make
```

#### 5. Reset hoàn toàn hệ thống
```bash
# Dừng và xóa tất cả containers
docker stop twenty_pg twenty_redis 2>/dev/null || true
docker rm twenty_pg twenty_redis 2>/dev/null || true

# Xóa volumes (nếu muốn xóa hoàn toàn data)
docker volume rm twenty_db_data 2>/dev/null || true

# Khởi động lại từ đầu
make postgres-on-docker redis-on-docker
npx nx run twenty-server:database:reset
yarn start
```

#### 6. Quản lý Docker containers
```bash
# Xem tất cả containers
docker ps -a

# Dừng containers
docker stop twenty_pg twenty_redis

# Khởi động lại containers
docker start twenty_pg twenty_redis

# Xem logs containers
docker logs twenty_pg
docker logs twenty_redis

# Truy cập vào container
docker exec -it twenty_pg bash
docker exec -it twenty_redis redis-cli
```

## 📝 Ghi chú quan trọng

### Tính năng đã được cấu hình sẵn:
- ✅ **Multi-workspace enabled**: Hỗ trợ nhiều workspace
- ✅ **Impersonation system**: Bật toàn bộ hệ thống impersonation
- ✅ **Admin users**: 4 admin users với quyền đầy đủ
- ✅ **Auto-seeding**: Tự động tạo data mẫu khi reset database

### Makefile Commands có sẵn:
```bash
# Khởi động PostgreSQL
make postgres-on-docker

# Khởi động Redis
make redis-on-docker

# Khởi động ClickHouse (cho analytics)
make clickhouse-on-docker

# Khởi động Grafana (cho monitoring)
make grafana-on-docker

# Khởi động OpenTelemetry Collector
make opentelemetry-collector-on-docker
```

### Workflow phát triển:
1. **Lần đầu setup**: Làm theo hướng dẫn từ đầu đến cuối
2. **Hàng ngày**:
   - Kiểm tra containers: `docker ps`
   - Nếu containers đã chạy: `yarn start`
   - Nếu containers chưa chạy: `make postgres-on-docker redis-on-docker` rồi `yarn start`
3. **Khi có thay đổi database**: Chạy `npx nx run twenty-server:database:reset`
4. **Khi chuyển máy**: Copy toàn bộ folder và chạy lại từ bước "Khởi động hệ thống"

### Thư mục quan trọng:
- `packages/twenty-server/`: Backend code
- `packages/twenty-front/`: Frontend code
- `.local-storage/`: File storage local
- `workflow/`: Documentation và guides

## 🎯 Kết luận

Sau khi hoàn thành setup, bạn sẽ có:
- Hệ thống Twenty CRM hoàn chỉnh chạy trên localhost
- 4 admin accounts với quyền impersonation
- Database với sample data
- Môi trường phát triển sẵn sàng

**Truy cập**: http://localhost:3001 và đăng nhập với một trong 4 admin accounts để bắt đầu sử dụng!

## 🚀 Cấu hình nâng cao

### Environment Variables chi tiết

#### Database Configuration
```env
# Primary database
PG_DATABASE_URL=postgres://twenty:twenty@localhost:5432/twenty

# Cache database (Redis - tùy chọn)
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Security & Authentication
```env
# JWT Secrets (tạo random strings)
ACCESS_TOKEN_SECRET=$(openssl rand -base64 32)
LOGIN_TOKEN_SECRET=$(openssl rand -base64 32)
REFRESH_TOKEN_SECRET=$(openssl rand -base64 32)
FILE_TOKEN_SECRET=$(openssl rand -base64 32)

# CORS
FRONT_BASE_URL=http://localhost:3001
SERVER_URL=http://localhost:3000
```

#### Email Configuration (tùy chọn)
```env
# SMTP Settings
EMAIL_DRIVER=smtp
EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASSWORD=your-app-password
```

#### File Storage
```env
# Local storage
STORAGE_TYPE=local
STORAGE_LOCAL_PATH=.local-storage

# S3 storage (production)
# STORAGE_TYPE=s3
# STORAGE_S3_REGION=us-east-1
# STORAGE_S3_BUCKET=your-bucket
# STORAGE_S3_ACCESS_KEY_ID=your-access-key
# STORAGE_S3_SECRET_ACCESS_KEY=your-secret-key
```

### Development Tips

#### 1. Useful Commands
```bash
# Xem logs chi tiết
yarn start --verbose

# Chạy chỉ backend
yarn nx serve twenty-server

# Chạy chỉ frontend
yarn nx serve twenty-front

# Build production
yarn build

# Run tests
yarn test

# Lint code
yarn lint
```

#### 2. Database Management
```bash
# Backup database từ Docker container
docker exec twenty_pg pg_dump -U postgres default > backup.sql

# Restore database vào Docker container
cat backup.sql | docker exec -i twenty_pg psql -U postgres -d default

# Backup với Docker volume
docker run --rm -v twenty_db_data:/data -v $(pwd):/backup alpine tar czf /backup/db_backup.tar.gz /data

# Restore từ volume backup
docker run --rm -v twenty_db_data:/data -v $(pwd):/backup alpine tar xzf /backup/db_backup.tar.gz -C /

# Reset chỉ schema (giữ data)
npx nx run twenty-server:database:migrate

# Xem migrations
npx nx run twenty-server:database:show-migrations
```

#### 3. Debugging
```bash
# Debug mode với breakpoints
yarn start:debug

# Xem database queries
DEBUG=typeorm:query yarn start

# Memory usage monitoring
node --inspect yarn start
```

## 📊 Monitoring & Logs

### Log Files
- **Server logs**: Console output khi chạy `yarn start`
- **Database logs**: PostgreSQL logs (thường ở `/var/log/postgresql/`)
- **Error logs**: Hiển thị trực tiếp trong terminal

### Health Checks
- **Backend health**: http://localhost:3000/healthz
- **Database connection**: Kiểm tra trong server logs
- **Frontend status**: http://localhost:3001 (should load login page)

## 🔄 Workflow Updates

### Khi có code changes:
1. **Frontend changes**: Auto-reload (HMR enabled)
2. **Backend changes**: Auto-restart (nodemon enabled)
3. **Database schema changes**: Chạy `npx nx run twenty-server:database:reset`

### Khi pull code mới:
```bash
git pull origin main
yarn install                                    # Update dependencies
npx nx run twenty-server:database:reset        # Reset DB if schema changed
yarn start                                      # Restart application
```

### Khi chuyển branch:
```bash
git checkout <branch-name>
yarn install                                    # Install new dependencies
npx nx run twenty-server:database:reset        # Reset DB for new schema
yarn start                                      # Start with new code
```

## 🎯 Production Deployment (Tham khảo)

### Environment Setup
```env
NODE_ENV=production
PG_DATABASE_URL=postgres://user:pass@prod-db:5432/twenty
FRONT_BASE_URL=https://your-domain.com
SERVER_URL=https://api.your-domain.com
STORAGE_TYPE=s3
```

### Build Commands
```bash
yarn build
yarn start:prod
```

## 📞 Support & Resources

### Documentation
- **Official Docs**: https://twenty.com/developers
- **API Reference**: http://localhost:3000/graphql (khi server chạy)
- **Component Library**: Storybook (nếu có)

### Community
- **GitHub Issues**: https://github.com/twentyhq/twenty/issues
- **Discord**: Twenty Community Discord
- **Discussions**: GitHub Discussions

---

**🎉 Chúc bạn phát triển thành công với Twenty CRM!**
