# Doni Logistics - Modern Logistics Management Platform

A comprehensive logistics management platform built with Jmix (Java) backend and React frontend, featuring multi-tenant architecture, real-time tracking, and modern UI/UX.

## 🚀 Features

### Core Features
- **Multi-tenant Architecture**: Organizations can manage their own data independently
- **User Management**: Role-based access control with email verification
- **Fleet Management**: Vehicle tracking, maintenance scheduling, and driver assignment
- **Shipment Tracking**: Real-time shipment status updates and tracking
- **Modern UI/UX**: Beautiful, responsive design with Doni Logistics branding

### User Roles
- **Super Administrator**: Full system access
- **Organization Administrator**: Organization-level management
- **Dispatcher/Fleet Manager**: Fleet and route management
- **Driver**: Mobile-friendly driver interface
- **Warehouse Manager**: Inventory and warehouse operations
- **Facilitator**: Customer service and coordination
- **Customer Service**: Customer support and inquiries
- **Accountant**: Financial management and reporting
- **Operations Manager**: Overall operations oversight

## 🛠 Technology Stack

### Backend (Jmix)
- **Framework**: Jmix 2.6.1 (Spring Boot-based)
- **Database**: HSQLDB (can be changed to PostgreSQL/MySQL)
- **Security**: OAuth2 with JWT tokens
- **API**: REST API with automatic CRUD operations
- **Database Migration**: Liquibase

### Frontend (React)
- **Framework**: React 18
- **Styling**: Tailwind CSS
- **State Management**: React Hook Form
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI Components**: Lucide React Icons
- **Notifications**: React Hot Toast

## 📋 Prerequisites

- Java 17 or higher
- Node.js 16 or higher
- npm or yarn
- IntelliJ IDEA (recommended for Jmix development)

## 🚀 Quick Start

### 1. Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd donilogistics
   ```

2. **Open in IntelliJ IDEA**
   - Open the project in IntelliJ IDEA
   - Install Jmix plugin if not already installed
   - Let Gradle sync complete

3. **Run the application**
   - Run `DonilogisticsApplication.java`
   - The application will start on `http://localhost:8080`

4. **Database Setup**
   - The application uses HSQLDB by default
   - Database files will be created in `.jmix/hsqldb/` directory
   - Liquibase will automatically create all tables

### 2. Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   The frontend will start on `http://localhost:3000`

## 🔧 Configuration

### Backend Configuration

The main configuration is in `src/main/resources/application.properties`:

```properties
# Database configuration
main.datasource.url=jdbc:hsqldb:file:.jmix/hsqldb/donilogistics
main.datasource.username=sa
main.datasource.password=

# REST API configuration
jmix.rest.services-config=rest-services.xml
jmix.resource-server.anonymous-url-patterns=/rest/services/doni_UserRegistrationService/getActiveOrganizations,/rest/services/doni_UserRegistrationService/registerUser,/rest/services/doni_UserRegistrationService/verifyEmail

# OAuth2 configuration
spring.security.oauth2.authorizationserver.client.myclient.registration.client-id=hqdktdfktq
spring.security.oauth2.authorizationserver.client.myclient.registration.client-secret={noop}vpjmbwfpxv
```

### Frontend Configuration

The API base URL is configured in `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';
```

## 📊 API Endpoints

### Authentication
- `POST /oauth2/token` - Login
- `POST /rest/services/doni_UserRegistrationService/registerUser` - User registration
- `POST /rest/services/doni_UserRegistrationService/verifyEmail` - Email verification
- `GET /rest/services/doni_UserRegistrationService/getActiveOrganizations` - Get organizations

### Entities
- `GET /rest/entities/doni_User` - Get users
- `GET /rest/entities/doni_Organization` - Get organizations
- `GET /rest/entities/doni_Vehicle` - Get vehicles
- `GET /rest/entities/doni_Shipment` - Get shipments

### Services
- `POST /rest/services/doni_LogisticsService/createShipment` - Create shipment
- `POST /rest/services/doni_LogisticsService/updateShipmentStatus` - Update shipment status
- `POST /rest/services/doni_LogisticsService/assignVehicleToShipment` - Assign vehicle
- `POST /rest/services/doni_LogisticsService/assignDriverToShipment` - Assign driver

## 🎨 UI/UX Features

### Design System
- **Colors**: Doni Logistics brand colors (Blue: #1e40af, Orange: #f97316)
- **Typography**: Inter font family
- **Components**: Custom Tailwind CSS components
- **Icons**: Lucide React icon set

### Responsive Design
- Mobile-first approach
- Responsive navigation
- Adaptive layouts for all screen sizes

### User Experience
- Multi-step registration process
- Password strength indicators
- Real-time form validation
- Toast notifications
- Loading states

## 🔐 Security

### Authentication
- OAuth2 with JWT tokens
- Password-based authentication
- Email verification for new users
- Role-based access control

### Authorization
- Entity-level permissions
- Attribute-level permissions
- Multi-tenant data isolation

## 📱 Multi-tenant Architecture

### Organization Isolation
- Each organization has its own data
- Users are associated with specific organizations
- Cross-organization data access is restricted

### User Management
- Organization administrators can manage their users
- Role-based permissions within organizations
- Email verification for security

## 🚛 Logistics Features

### Fleet Management
- Vehicle registration and tracking
- Driver assignment
- Maintenance scheduling
- GPS tracking integration

### Shipment Management
- Shipment creation and tracking
- Status updates
- Route optimization
- Cost tracking

## 🛠 Development

### Adding New Entities

1. Create entity class in `src/main/java/com/donilogistics/entity/`
2. Add to Liquibase changelog
3. Create REST service if needed
4. Add to frontend API service

### Adding New Features

1. Backend: Create service classes and REST endpoints
2. Frontend: Create React components and API integration
3. Update security roles if needed

## 📦 Deployment

### Backend Deployment
- Build with Gradle: `./gradlew build`
- Run JAR file: `java -jar build/libs/donilogistics-0.0.1-SNAPSHOT.jar`

### Frontend Deployment
- Build: `npm run build`
- Deploy `build/` directory to web server

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Basic user management
- ✅ Multi-tenant architecture
- ✅ Fleet management
- ✅ Shipment tracking

### Phase 2 (Planned)
- 📱 Mobile app for drivers
- 📊 Advanced analytics dashboard
- 🔔 Real-time notifications
- 🗺️ Route optimization

### Phase 3 (Future)
- 🤖 AI-powered insights
- 📈 Advanced reporting
- 🔗 Third-party integrations
- 🌍 Multi-language support

---

**Doni Logistics** - Modern logistics solutions for the digital age.
