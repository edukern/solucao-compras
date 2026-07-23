-- Torna estacao e ano opcionais — nome já contém toda a informação (ex: "26/1")
ALTER TABLE colecoes
  ALTER COLUMN estacao DROP NOT NULL,
  ALTER COLUMN ano     DROP NOT NULL;
