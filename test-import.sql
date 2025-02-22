-- Crear tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos datos de ejemplo
INSERT INTO users (name, email) VALUES
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Wilson', 'bob@example.com');

-- Crear tabla de posts
CREATE TABLE posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar algunos posts
INSERT INTO posts (user_id, title, content) VALUES
    (1, 'Mi primer post', 'Este es el contenido del primer post'),
    (1, 'Otro post', 'Más contenido interesante'),
    (2, 'Hola mundo', 'Un post de Jane'); 