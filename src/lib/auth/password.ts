import {
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
  type ScryptOptions,
} from "node:crypto";
import { promisify } from "node:util";

// `promisify` retient la surcharge sans options ; on réexpose celle qui les accepte.
const scrypt = promisify(scryptCallback) as (
  password: string,
  salt: Buffer,
  keylen: number,
  options: ScryptOptions
) => Promise<Buffer>;

/**
 * Paramètres scrypt. N = 2^15 avec r = 8 demande 32 Mio par calcul, ce qui
 * rend une attaque par dictionnaire coûteuse tout en restant sous la seconde
 * côté serveur. Ils sont stockés dans l'empreinte : les durcir plus tard
 * n'invalidera pas les mots de passe existants.
 */
const N = 32768;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
/** scrypt exige 128 × N × r octets de mémoire ; la valeur par défaut de Node est trop basse. */
const MAX_MEM = 192 * 1024 * 1024;

async function derive(
  password: string,
  salt: Buffer,
  n: number,
  r: number,
  p: number
): Promise<Buffer> {
  return scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, {
    N: n,
    r,
    p,
    maxmem: MAX_MEM,
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = await derive(password, salt, N, R, P);
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${key.toString("base64")}`;
}

/**
 * Comparaison à temps constant. Une empreinte illisible renvoie `false` plutôt
 * que de lever : un enregistrement corrompu ne doit pas devenir un oracle.
 */
export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split("$");
  if (parts.length !== 6 || parts[0] !== "scrypt") return false;

  const [, n, r, p, salt, key] = parts;
  const expected = Buffer.from(key, "base64");

  try {
    const actual = await derive(
      password,
      Buffer.from(salt, "base64"),
      Number(n),
      Number(r),
      Number(p)
    );
    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  } catch {
    return false;
  }
}

/**
 * Empreinte jetable utilisée quand l'e-mail est inconnu. Sans elle, une
 * réponse instantanée trahirait l'absence du compte : l'énumération des
 * utilisateurs deviendrait triviale.
 */
export async function fakeVerify(password: string): Promise<void> {
  await derive(password, Buffer.alloc(SALT_LENGTH), N, R, P);
}
