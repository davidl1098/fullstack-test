# Inventario — Microservicios .NET + Angular

## Requisitos

- **.NET SDK** 8
- **Node.js** 18+ y **Node: 20+**
- **SQL Server** (LocalDB)
- **Git**
- Entity Framework
> **BD**: ajusta la cadena de cada microservicio en `api/(Transactions o Products)/appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "Default": "Server=<TU_SERVIDOR_SQL>;Database=InventoryDb;Trusted_Connection=True;"
  },
  "AllowedOrigins": [ "http://localhost:4200" ]
}
```
## Ejecución del backend 
  
Ubicados en la raiz del proyecto, para la ejecución del microservicio de Products:
```bash
dotnet run --project api/Products/Products.csproj   
```

Para la ejecución del microservicio de Transactions:
```bash
dotnet run --project api/Transactions/Transactions.csproj
```
Si la base de datos da problemas o no esta actualizada:
```bash
dotnet tool install --global dotnet-ef   # una sola vez
cd api
dotnet ef database update
```
El proyecto cuenta con las migraciones iniciales para la base de datos pero en caso de ser necesario se puede correr el siguiente comando para crearlas 
```bash
dotnet ef migrations add InitProducts -p api/Products -s api/Products -o Data/Migrations
dotnet ef migrations add InitTransactions -p api/Transactions -s api/Transactions -o Data/Migrations
```
*** Importante
- Cada microservicio se conecta a la misma base de datos pero es necesario correr las migraciones de ambos para tener la DB completa
- El microservicio de Transactions se conecta sincronicamente al de Products



## Ejecución del frontend 

Ubicados en la raiz del proyecto:
```bash
cd web
npm start
```

## Evidencias

Listado dinámico de productos y transacciones con paginación. 

<img width="1894" height="841" alt="image" src="https://github.com/user-attachments/assets/666cb53a-c36a-45df-aa7e-04e59c9876fb" />
<img width="1896" height="826" alt="image" src="https://github.com/user-attachments/assets/b2d504fc-d1c5-4e39-aa23-7e4fd27089bf" />

Pantalla para la creación de productos.

<img width="1898" height="909" alt="image" src="https://github.com/user-attachments/assets/1783d274-dc00-4fa6-9346-80e558f9a649" />

Pantalla para la edición de productos.

<img width="1894" height="993" alt="image" src="https://github.com/user-attachments/assets/7b73a68d-8365-42cb-b23c-5c62cb7069af" />

Pantalla para la creación de transacciones.

<img width="1888" height="925" alt="image" src="https://github.com/user-attachments/assets/433c076f-6c62-4cde-adc0-61678ecbec20" />

Pantalla para la edición de transacciones.

<img width="1881" height="936" alt="image" src="https://github.com/user-attachments/assets/b6922f79-2213-4025-8a98-616a152d49f1" />

Pantalla de filtros dinámicos.

<img width="1849" height="286" alt="image" src="https://github.com/user-attachments/assets/45a9e3ec-1aaa-4ea6-8864-6b62842172cc" />
<img width="1866" height="876" alt="image" src="https://github.com/user-attachments/assets/3ce1a400-ebe1-462c-a85e-4ca3bac58bba" />








