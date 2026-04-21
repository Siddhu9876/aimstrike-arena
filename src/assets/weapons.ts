import pistol from "./weapon-pistol.jpg";
import dual from "./weapon-dual.jpg";
import smg from "./weapon-smg.jpg";
import rifle from "./weapon-rifle.jpg";
import type { WeaponId } from "@/game/weapons";

export const WEAPON_IMAGES: Record<WeaponId, string> = {
  pistol,
  dual_pistol: dual,
  smg,
  rifle,
};