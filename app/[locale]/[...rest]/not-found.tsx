// Empty on purpose: ./layout.tsx already renders the localized 404 view,
// because a not-found file gets no params and cannot know the locale.
export default function LocaleCatchAllNotFound() {
  return null;
}
