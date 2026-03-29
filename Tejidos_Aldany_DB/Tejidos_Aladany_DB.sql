-- 1. Crear Tablas Maestras (Sin dependencias)
CREATE TABLE Proveedor (
    idproveedor SERIAL PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    materialDisponible VARCHAR(45)
);

CREATE TABLE Cliente (
    idCliente SERIAL PRIMARY KEY,
    nombre VARCHAR(45) NOT NULL,
    contacto VARCHAR(45)
);

CREATE TABLE CostoPedido (
    idCostoPedido SERIAL PRIMARY KEY,
    Total INT NOT NULL
);

CREATE TABLE ConfeccionistaExterno (
    idConfeccionistaExterno SERIAL PRIMARY KEY,
    Nombre VARCHAR(45),
    Especialidad VARCHAR(45)
);

-- 2. Tablas con Dependencias Simples
CREATE TABLE Material (
    idMaterial SERIAL PRIMARY KEY,
    tipo VARCHAR(45),
    color VARCHAR(45),
    Proveedor_idproveedor INT REFERENCES Proveedor(idproveedor)
);

CREATE TABLE Usuario (
    idUsuario SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Rol VARCHAR(45) NOT NULL -- Oficina, Supervisor, Tejedor
);

-- 3. Entidad Central: Pedido
CREATE TABLE Pedido (
    idPedido SERIAL PRIMARY KEY,
    codigo VARCHAR(45) UNIQUE NOT NULL,
    estado VARCHAR(45) NOT NULL, -- Activo, Finalizado, Cancelado
    Cliente_idCliente INT REFERENCES Cliente(idCliente),
    CostoPedido_idCostoPedido INT REFERENCES CostoPedido(idCostoPedido),
    Usuario_idUsuario INT REFERENCES Usuario(idUsuario),
    Confeccionista_id INT REFERENCES ConfeccionistaExterno(idConfeccionistaExterno)
);

-- 4. Tablas de la Jerarquía de Producción
CREATE TABLE Supervisor (
    idsupervisor SERIAL PRIMARY KEY,
    Nombre VARCHAR(45),
    Contacto VARCHAR(45),
    Pedido_idPedido INT REFERENCES Pedido(idPedido)
);

CREATE TABLE Tejedor (
    idTejedor SERIAL PRIMARY KEY,
    nombre VARCHAR(45),
    Produccion VARCHAR(100),
    Supervisor_idsupervisor INT REFERENCES Supervisor(idsupervisor)
);

-- 5. Detalle de los Pedidos
CREATE TABLE ItemPedidos (
    idItemPedidos SERIAL PRIMARY KEY,
    talla VARCHAR(45),
    color VARCHAR(45),
    Material_idMaterial INT REFERENCES Material(idMaterial),
    Pedido_idPedido INT REFERENCES Pedido(idPedido)
);