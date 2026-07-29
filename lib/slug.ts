import { customAlphabet } from "nanoid";

// lowercase + digits, excludes lookalikes: 0, o, 1, l, i
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

export const generateSlug = customAlphabet(ALPHABET, 6);
