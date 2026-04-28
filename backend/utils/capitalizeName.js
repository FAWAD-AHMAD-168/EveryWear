const capitalizeName = (name) => {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default capitalizeName;
