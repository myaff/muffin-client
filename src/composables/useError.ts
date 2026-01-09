export default function useError(e: any, t: (key: string) => string) {
  return {
    title: e?.title as string ?? t('error.unknown.title'),
    message: e?.message as string || e?.errorMessage as string || t('error.unknown.message'),
  };
}