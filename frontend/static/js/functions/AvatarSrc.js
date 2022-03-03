export default function AvatarSrc(username, size) {
  const userSlug = username.replace(/\s/g, '-');
  const avatarSize = typeof size == 'number' ? size : 30;
  return `https://adorable-avatars.broken.services/${avatarSize}/${userSlug}.png`;
}
