import { useLocaleStore } from "@/store/locale";
import { getTranslation } from "./translations";

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  const t = (key: string) => getTranslation(locale, key);
  return { t, locale };
}
