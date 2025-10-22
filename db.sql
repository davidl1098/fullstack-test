/* ============================
   Inventario - Script de BD
   Motor: SQL Server
   Crea BD, tablas e índices
   ============================ */

-- 1) Crear BD si no existe
IF DB_ID('InventarioDb') IS NULL
BEGIN
  PRINT 'Creando BD InventarioDb...';
  CREATE DATABASE InventarioDb;
END
GO

USE InventarioDb;
GO

-- 2) Tabla Products
IF OBJECT_ID('dbo.Products') IS NULL
BEGIN
  CREATE TABLE dbo.Products (
    Id          INT IDENTITY(1,1) PRIMARY KEY,
    Name        NVARCHAR(120)  NOT NULL,
    Description NVARCHAR(1000) NULL,
    Category    NVARCHAR(80)   NOT NULL,
    Price       DECIMAL(18,2)  NOT NULL CONSTRAINT DF_Products_Price DEFAULT(0),
    Stock       INT            NOT NULL CONSTRAINT DF_Products_Stock DEFAULT(0),
    ImageUrl    NVARCHAR(400)  NULL,
    RowVersion  ROWVERSION     NOT NULL
  );
END
GO

-- 3) Tabla Transactions
IF OBJECT_ID('dbo.Transactions') IS NULL
BEGIN
  CREATE TABLE dbo.[Transactions] (
    Id            INT IDENTITY(1,1) PRIMARY KEY,
    [Date]        DATETIME2(0) NOT NULL CONSTRAINT DF_Transactions_Date DEFAULT SYSUTCDATETIME(),
    [Type]        NVARCHAR(10) NOT NULL
                   CONSTRAINT CK_Transactions_Type CHECK ([Type] IN (N'COMPRA', N'VENTA')),
    ProductId     INT NOT NULL
                   CONSTRAINT FK_Transactions_Products
                   FOREIGN KEY REFERENCES dbo.Products(Id),
    Quantity      INT NOT NULL CONSTRAINT CK_Transactions_Quantity CHECK (Quantity > 0),
    UnitPrice     DECIMAL(18,2) NOT NULL CONSTRAINT CK_Transactions_UnitPrice CHECK (UnitPrice >= 0),
    TotalPrice    AS (Quantity * UnitPrice) PERSISTED,
    Detail        NVARCHAR(1000) NULL
  );
END
GO


