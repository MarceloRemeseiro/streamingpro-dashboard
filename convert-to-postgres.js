const fs = require('fs');

// Leer el archivo MySQL
const mysqlDump = fs.readFileSync('backup_eevm.sql', 'utf8');

function convertTable(tableName, createStatement, insertStatements) {
  let result = `DROP TABLE IF EXISTS "${tableName}" CASCADE;\n`;
  
  // Convertir CREATE TABLE
  result += createStatement
    // Primero convertir los tipos de datos
    .replace(/int\(\d+\) NOT NULL AUTO_INCREMENT/g, 'SERIAL')
    .replace(/tinyint\(\d+\)/gi, 'BOOLEAN')
    .replace(/int\(\d+\)/g, 'INTEGER')
    .replace(/datetime\(\d+\)/g, 'TIMESTAMP')
    .replace(/varchar\((\d+)\)/g, 'VARCHAR($1)')
    .replace(/text/g, 'TEXT')
    // Luego convertir los identificadores
    .replace(/`([^`]*)`/g, '"$1"')
    // Finalmente limpiar la sintaxis MySQL
    .replace(/\) ENGINE=.*$/g, ');')
    .replace(/DEFAULT NULL/g, 'DEFAULT NULL')
    .replace(/PRIMARY KEY \(`([^`]*)`\)/g, 'PRIMARY KEY ("$1")');

  // Añadir INSERTs si existen
  if (insertStatements.length > 0) {
    result += '\n' + insertStatements
      .map(stmt => stmt
        .replace(/`([^`]*)`/g, '"$1"')
        .replace(/,1,/g, ',true,')
        .replace(/,0,/g, ',false,')
        .replace(/\\''/g, "''")
        .replace(/\\'/g, "''")
      )
      .join('\n');
  }

  return result + '\n\n';
}

// Procesar el dump
let tables = new Map();
let currentTable = null;
let currentStatement = [];
let isInCreateTable = false;

// Procesar línea por línea
mysqlDump.split('\n').forEach(line => {
  // Ignorar líneas de bloqueo y comentarios
  if (line.includes('LOCK TABLES') || line.includes('UNLOCK TABLES') || line.startsWith('/*')) {
    return;
  }

  if (line.includes('CREATE TABLE')) {
    const tableMatch = line.match(/CREATE TABLE [`"]([^`"]*)[`"]/);
    if (tableMatch) {
      currentTable = tableMatch[1];
      isInCreateTable = true;
      currentStatement = [line];
      if (!tables.has(currentTable)) {
        tables.set(currentTable, { create: '', inserts: [] });
      }
    }
  } else if (line.includes('INSERT INTO')) {
    if (currentTable) {
      tables.get(currentTable).inserts.push(line);
    }
  } else if (isInCreateTable) {
    if (line.includes(';')) {
      isInCreateTable = false;
      currentStatement.push(line);
      tables.get(currentTable).create = currentStatement.join('\n');
    } else {
      currentStatement.push(line);
    }
  }
});

// Generar el archivo PostgreSQL
let postgresDump = 'BEGIN;\n\n';

// Procesar cada tabla
for (let [tableName, { create, inserts }] of tables) {
  postgresDump += convertTable(tableName, create, inserts);
}

postgresDump += 'COMMIT;\n';

// Guardar el archivo
fs.writeFileSync('backup_postgres.sql', postgresDump);
console.log('Conversión completada. Archivo generado: backup_postgres.sql'); 