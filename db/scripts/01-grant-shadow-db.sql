-- Local development only (mounted by docker-compose.local.yaml).
--
-- `prisma migrate dev` creates and drops a temporary "shadow" database to validate
-- migrations, so the app user needs server-wide CREATE/DROP rights. The MariaDB image only
-- grants MARIADB_USER rights on MARIADB_DATABASE, which makes `db:migrate` fail with P3014.
--
-- The MariaDB entrypoint runs this once, after creating the user, the first time the
-- container starts with an empty `db_data` volume. Never apply this to a shared or
-- production database.
GRANT ALL PRIVILEGES ON *.* TO 'libre_train'@'%';
FLUSH PRIVILEGES;
