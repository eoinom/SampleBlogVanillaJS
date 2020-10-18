export default function AvatarSrc(username, size) {
  const userSlug = username.replace(/\s/g, '-');
  const avatarSize = typeof(size) == 'number' ? size : 30;
  return `https://api.adorable.io/avatars/${avatarSize}/${userSlug}.png`;
}