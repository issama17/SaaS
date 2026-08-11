/**
 * Constantes partagées entre le middleware (runtime edge) et la couche
 * serveur. Ce fichier ne doit rien importer de Node ni de Prisma : le
 * middleware ne peut pas les charger.
 */
export const SESSION_COOKIE = "outpost_session";
