# FitByte Project - Diagram Descriptions

## 1. DATA FLOW DIAGRAM (DFD) - Level 0 & Level 1

### Level 0 DFD (Context Diagram)

**External Entities:**
- Customer
- Admin

**Central Process:**
- FitByte Tailoring System

**Data Flows:**
- Customer → System: Registration Data, Login Credentials, Order Details, Measurements, Fabric Preferences
- System → Customer: Order Confirmation, Saved Measurements, Order Status
- Admin → System: Manage Clothing Types, Manage Fabrics, Manage Colors, Manage Patterns, View Customer Data
- System → Admin: System Reports, Customer Lists, Measurement Data

---

### Level 1 DFD (Detailed Processes)

**Process 1: User Authentication & Management**
- Input: Registration Data, Login Credentials
- Output: User Profile, Authentication Token
- Data Stores: User Database
- Description: Handles user registration, login, and role-based access (Customer/Admin)

**Process 2: Clothing Type Management**
- Input: Clothing Type Details (Name, Gender)
- Output: Available Clothing Types List
- Data Stores: ClothingType Database, MeasurementField Database
- Description: Admin creates/updates/deletes clothing types with gender categorization (Male/Female/Kids)

**Process 3: Fabric & Design Management**
- Input: Fabric Name, Color Data (Name, Hex Code), Pattern Name
- Output: Available Fabrics, Colors, Patterns Lists
- Data Stores: Fabric Database, FabricColor Database, Pattern Database
- Description: Admin manages fabric materials, color palettes, and pattern options

**Process 4: Measurement Field Configuration**
- Input: Measurement Field Specifications (Field Name, Label, Unit, Required Status)
- Output: Configured Measurement Fields per Clothing Type
- Data Stores: MeasurementField Database
- Description: Admin defines which measurements are needed for each clothing type

**Process 5: Customer Measurement Management**
- Input: Measurement Values, Size Type (Standard/Custom), Clothing Type
- Output: Saved Measurements, Measurement Retrieval
- Data Stores: SavedMeasurement Database
- Description: Customers save and retrieve their measurements for different garment types

**Process 6: Order Creation & Preview**
- Input: Gender, Clothing Type, Fabric, Color, Pattern, Measurements
- Output: Live Preview, Order Data
- Data Stores: All relevant databases
- Description: Customers configure orders with real-time visual preview using SVG rendering

**Data Stores:**
- D1: User (id, username, email, password, role, phone, first_name, last_name)
- D2: ClothingType (id, name, gender)
- D3: Fabric (id, name)
- D4: FabricColor (id, name, hex_code)
- D5: Pattern (id, name)
- D6: MeasurementField (id, clothing_type_id, field_name, field_label, unit, is_required)
- D7: SavedMeasurement (id, user_id, label, clothing_type_id, size_type, standard_size, measurements_json, created_at, updated_at)

---

## 2. UML CLASS DIAGRAM

### Complete Class Structure with All 7 Models

```
┌─────────────────────────────────────────────────┐
│                    User                         │
│ (Inherits from AbstractUser)                    │
├─────────────────────────────────────────────────┤
│ - id: Integer [PK]                              │
│ - username: String [Unique]                     │
│ - email: String [Unique]                        │
│ - password: String                              │
│ - first_name: String                            │
│ - last_name: String                             │
│ - role: String [Choices: customer, admin]       │
│ - phone: String [Optional]                      │
│ - date_joined: DateTime                         │
│ - is_active: Boolean                            │
│ - is_staff: Boolean                             │
│ - is_superuser: Boolean                         │
├─────────────────────────────────────────────────┤
│ + __str__(): String                             │
│ + has_perm(): Boolean                           │
│ + has_module_perms(): Boolean                   │
└─────────────────────────────────────────────────┘
                    │
                    │ 1
                    │
                    │ *
                    ▼
┌─────────────────────────────────────────────────┐
│            SavedMeasurement                      │
├─────────────────────────────────────────────────┤
│ - id: Integer [PK]                              │
│ - user_id: Integer [FK → User]                  │
│ - label: String                                 │
│ - clothing_type_id: Integer [FK → ClothingType] │
│ - size_type: String [Choices: standard, custom] │
│ - standard_size: String [Optional]              │
│ - measurements: JSON                            │
│ - created_at: DateTime                          │
│ - updated_at: DateTime                          │
├─────────────────────────────────────────────────┤
│ + __str__(): String                             │
│ + to_dict(): Dictionary                         │
└─────────────────────────────────────────────────┘
                    │
                    │ *
                    │
                    │ 1
                    ▼
┌─────────────────────────────────────────────────┐
│              ClothingType                        │
├─────────────────────────────────────────────────┤
│ - id: Integer [PK]                              │
│ - name: String                                  │
│ - gender: String [Choices: male, female, kids]  │
├─────────────────────────────────────────────────┤
│ [Unique Together: name, gender]                 │
├─────────────────────────────────────────────────┤
│ + __str__(): String                             │
│ + get_measurement_fields(): QuerySet            │
└─────────────────────────────────────────────────┘
                    │
                    │ 1
                    │
                    │ *
                    ▼
┌─────────────────────────────────────────────────┐
│           MeasurementField                       │
├─────────────────────────────────────────────────┤
│ - id: Integer [PK]                              │
│ - clothing_type_id: Integer [FK → ClothingType] │
│ - field_name: String                            │
│ - field_label: String                           │
│ - unit: String [Default: inches]                │
│ - is_required: Boolean [Default: True]          │
├─────────────────────────────────────────────────┤
│ [Unique Together: clothing_type, field_name]    │
├─────────────────────────────────────────────────┤
│ + __str__(): String                             │
│ + validate_measurement(): Boolean               │
└─────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────┐
│                  Fabric                          │
├─────────────────────────────────────────────────┤
│ - id: Integer [PK]                              │
│ - name: String [Unique]                         │
├─────────────────────────────────────────────────┤
│ + __str__(): String                             │
└─────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────┐
│               FabricColor                        │
├─────────────────────────────────────────────────┤
│ - id: Integer [PK]                              │
│ - name: String [Unique]                         │
│ - hex_code: String [Optional, Format: #RRGGBB]  │
├─────────────────────────────────────────────────┤
│ + __str__(): String                             │
│ + get_rgb(): Tuple                              │
└─────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────┐
│                 Pattern                          │
├─────────────────────────────────────────────────┤
│ - id: Integer [PK]                              │
│ - name: String [Unique]                         │
├─────────────────────────────────────────────────┤
│ + __str__(): String                             │
└─────────────────────────────────────────────────┘
```

### Relationships:

1. **User ─── SavedMeasurement** (One-to-Many)
   - One User can have multiple SavedMeasurements
   - Relation: user_id (FK in SavedMeasurement)
   - Related name: saved_measurements

2. **ClothingType ─── SavedMeasurement** (One-to-Many)
   - One ClothingType can be used in multiple SavedMeasurements
   - Relation: clothing_type_id (FK in SavedMeasurement)

3. **ClothingType ─── MeasurementField** (One-to-Many)
   - One ClothingType has multiple MeasurementFields
   - Relation: clothing_type_id (FK in MeasurementField)
   - Related name: measurement_fields

4. **Fabric, FabricColor, Pattern** (Independent Entities)
   - These are lookup/reference tables
   - Used in order creation process
   - No direct FK relationships but used in business logic

---

## 3. DATABASE DESIGN (ER DIAGRAM)

### Entity-Relationship Diagram with Complete Schema

```
┌══════════════════════════════════════════════════════════════┐
║                         USER                                 ║
╠══════════════════════════════════════════════════════════════╣
║ PK │ id                    INTEGER                           ║
║    │ username              VARCHAR(150) UNIQUE NOT NULL      ║
║    │ email                 VARCHAR(254) UNIQUE NOT NULL      ║
║    │ password              VARCHAR(128) NOT NULL             ║
║    │ first_name            VARCHAR(150)                      ║
║    │ last_name             VARCHAR(150)                      ║
║    │ role                  VARCHAR(20) CHECK(customer,admin) ║
║    │ phone                 VARCHAR(20) NULL                  ║
║    │ date_joined           DATETIME DEFAULT NOW()            ║
║    │ last_login            DATETIME NULL                     ║
║    │ is_active             BOOLEAN DEFAULT TRUE              ║
║    │ is_staff              BOOLEAN DEFAULT FALSE             ║
║    │ is_superuser          BOOLEAN DEFAULT FALSE             ║
╠══════════════════════════════════════════════════════════════╣
║ Indexes: username, email, role                               ║
╚══════════════════════════════════════════════════════════════╝
                           │
                           │ 1
                           │ has
                           │
                           │ N
                           ▼
┌══════════════════════════════════════════════════════════════┐
║                    SAVED_MEASUREMENT                         ║
╠══════════════════════════════════════════════════════════════╣
║ PK │ id                    INTEGER                           ║
║ FK │ user_id               INTEGER → USER(id) CASCADE        ║
║ FK │ clothing_type_id      INTEGER → CLOTHINGTYPE(id)        ║
║    │ label                 VARCHAR(100) NOT NULL             ║
║    │ size_type             VARCHAR(10) CHECK(standard,custom)║
║    │ standard_size         VARCHAR(5) NULL                   ║
║    │ measurements          JSON DEFAULT {}                   ║
║    │ created_at            DATETIME DEFAULT NOW()            ║
║    │ updated_at            DATETIME DEFAULT NOW()            ║
╠══════════════════════════════════════════════════════════════╣
║ Indexes: user_id, clothing_type_id, created_at              ║
║ Foreign Keys:                                                ║
║   - user_id REFERENCES user(id) ON DELETE CASCADE            ║
║   - clothing_type_id REFERENCES clothing_type(id)            ║
╚══════════════════════════════════════════════════════════════╝
                           │
                           │ N
                           │ for
                           │
                           │ 1
                           ▼
┌══════════════════════════════════════════════════════════════┐
║                     CLOTHING_TYPE                            ║
╠══════════════════════════════════════════════════════════════╣
║ PK │ id                    INTEGER                           ║
║    │ name                  VARCHAR(100) NOT NULL             ║
║    │ gender                VARCHAR(10) CHECK(male,female,kids)║
╠══════════════════════════════════════════════════════════════╣
║ Unique Constraints: (name, gender)                           ║
║ Indexes: name, gender                                        ║
╚══════════════════════════════════════════════════════════════╝
                           │
                           │ 1
                           │ defines
                           │
                           │ N
                           ▼
┌══════════════════════════════════════════════════════════════┐
║                   MEASUREMENT_FIELD                          ║
╠══════════════════════════════════════════════════════════════╣
║ PK │ id                    INTEGER                           ║
║ FK │ clothing_type_id      INTEGER → CLOTHINGTYPE(id) CASCADE║
║    │ field_name            VARCHAR(50) NOT NULL              ║
║    │ field_label           VARCHAR(100) NOT NULL             ║
║    │ unit                  VARCHAR(10) DEFAULT 'inches'      ║
║    │ is_required           BOOLEAN DEFAULT TRUE              ║
╠══════════════════════════════════════════════════════════════╣
║ Unique Constraints: (clothing_type_id, field_name)          ║
║ Indexes: clothing_type_id                                    ║
║ Foreign Keys:                                                ║
║   - clothing_type_id REFERENCES clothing_type(id) CASCADE    ║
╚══════════════════════════════════════════════════════════════╝


┌══════════════════════════════════════════════════════════════┐
║                          FABRIC                              ║
╠══════════════════════════════════════════════════════════════╣
║ PK │ id                    INTEGER                           ║
║    │ name                  VARCHAR(100) UNIQUE NOT NULL      ║
╠══════════════════════════════════════════════════════════════╣
║ Indexes: name                                                ║
║ Description: Reference table for fabric types                ║
║ Examples: Cotton, Silk, Wool, Polyester, Linen, Denim       ║
╚══════════════════════════════════════════════════════════════╝


┌══════════════════════════════════════════════════════════════┐
║                       FABRIC_COLOR                           ║
╠══════════════════════════════════════════════════════════════╣
║ PK │ id                    INTEGER                           ║
║    │ name                  VARCHAR(50) UNIQUE NOT NULL       ║
║    │ hex_code              VARCHAR(7) NULL                   ║
╠══════════════════════════════════════════════════════════════╣
║ Indexes: name                                                ║
║ Check Constraint: hex_code LIKE '#______'                    ║
║ Description: Color palette for fabric selection              ║
║ Examples: Red (#FF0000), Blue (#0000FF), Navy (#000080)     ║
╚══════════════════════════════════════════════════════════════╝


┌══════════════════════════════════════════════════════════════┐
║                         PATTERN                              ║
╠══════════════════════════════════════════════════════════════╣
║ PK │ id                    INTEGER                           ║
║    │ name                  VARCHAR(50) UNIQUE NOT NULL       ║
╠══════════════════════════════════════════════════════════════╣
║ Indexes: name                                                ║
║ Description: Pattern types for fabric design                 ║
║ Examples: Solid, Striped, Checked, Plaid, Polka, Floral     ║
╚══════════════════════════════════════════════════════════════╝
```

### Cardinality Summary:

1. **User : SavedMeasurement** = 1:N
   - One user can save multiple measurements
   - Each saved measurement belongs to one user
   - ON DELETE: CASCADE (delete measurements when user deleted)

2. **ClothingType : SavedMeasurement** = 1:N
   - One clothing type can have multiple saved measurements
   - Each saved measurement is for one clothing type
   - ON DELETE: PROTECT (prevent deletion if measurements exist)

3. **ClothingType : MeasurementField** = 1:N
   - One clothing type defines multiple measurement fields
   - Each measurement field belongs to one clothing type
   - ON DELETE: CASCADE (delete fields when clothing type deleted)

4. **Fabric, FabricColor, Pattern** = Independent Reference Tables
   - No direct FK relationships in current schema
   - Used in application logic and future Order model
   - Master data tables managed by admin

---

## Database Indexing Strategy:

### Primary Indexes:
- user(id), user(username), user(email)
- clothing_type(id), clothing_type(name, gender)
- saved_measurement(id), saved_measurement(user_id), saved_measurement(created_at)
- measurement_field(id), measurement_field(clothing_type_id)
- fabric(id), fabric(name)
- fabric_color(id), fabric_color(name)
- pattern(id), pattern(name)

### Composite Indexes:
- saved_measurement(user_id, clothing_type_id)
- measurement_field(clothing_type_id, field_name)
- clothing_type(gender, name)

---

## Data Integrity Constraints:

### NOT NULL Constraints:
- All primary keys
- User: username, email, password
- ClothingType: name, gender
- MeasurementField: field_name, field_label
- SavedMeasurement: user_id, clothing_type_id, label

### UNIQUE Constraints:
- User: username, email
- ClothingType: (name, gender) composite
- MeasurementField: (clothing_type_id, field_name) composite
- Fabric: name
- FabricColor: name
- Pattern: name

### CHECK Constraints:
- User.role IN ('customer', 'admin')
- ClothingType.gender IN ('male', 'female', 'kids')
- SavedMeasurement.size_type IN ('standard', 'custom')
- FabricColor.hex_code MATCHES '^#[0-9A-Fa-f]{6}$'

### Foreign Key Constraints:
- SavedMeasurement.user_id → User.id (CASCADE)
- SavedMeasurement.clothing_type_id → ClothingType.id (PROTECT)
- MeasurementField.clothing_type_id → ClothingType.id (CASCADE)

---

## JSON Field Schema:

### SavedMeasurement.measurements (JSON):
```json
{
  "chest": "40",
  "waist": "34",
  "shoulder": "17",
  "sleeve_length": "24",
  "shirt_length": "29",
  "neck": "15.5",
  "hip": "38",
  "inseam": "32"
}
```
- Dynamic fields based on clothing_type
- All values stored as strings
- Validated against MeasurementField definitions
- Flexible schema for different garment types

---

## Sample Data Relationships:

### User → SavedMeasurement → ClothingType → MeasurementField

**User:** john@example.com (Customer)
  ↓
**SavedMeasurement:** "My Shirt Measurements"
  - size_type: custom
  - measurements: {"chest": "40", "waist": "34", "shoulder": "17"}
  ↓
**ClothingType:** Shirt (Male)
  ↓
**MeasurementFields:**
  - chest (required)
  - waist (required)
  - shoulder (required)
  - sleeve_length (required)
  - shirt_length (required)

---

## System Statistics (Current Seed Data):

- **Users:** 3 (1 Admin, 2 Customers)
- **Clothing Types:** 16 across 3 genders
  - Male: 6 types (Shirt, Pant, Kurta, Suit, Blazer, Sherwani)
  - Female: 6 types (Blouse, Salwar, Lehenga, Dress, Kurti, Saree Blouse)
  - Kids: 4 types (School Uniform, Casual Wear, Party Wear, Ethnic Wear)
- **Fabrics:** 10 types
- **Colors:** 15 colors with hex codes
- **Patterns:** 8 pattern types
- **Measurement Fields:** ~8-12 per clothing type (dynamic)

---

## Future Schema Extensions (Recommended):

### Order Model (Future):
```
Order
- id (PK)
- user_id (FK → User)
- clothing_type_id (FK → ClothingType)
- fabric_id (FK → Fabric)
- fabric_color_id (FK → FabricColor)
- pattern_id (FK → Pattern)
- measurements (JSON)
- status (pending, in_progress, completed, cancelled)
- order_date
- delivery_date
- price
```

### OrderItem Model (Future):
```
OrderItem
- id (PK)
- order_id (FK → Order)
- quantity
- special_instructions (TEXT)
- item_price
```

---

*Generated for FitByte Tailoring Management System*
*Database: SQLite3*
*ORM: Django 5.2.11*
*Models: 7 Core Tables*
