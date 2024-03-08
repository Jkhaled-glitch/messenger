export default function calculateTimeAgo(createdAt){
    const date = new Date(createdAt);
    const now = new Date();

    // Calculer la différence entre maintenant et la date de création du post en millisecondes
    const timeDifference = now - date;

    // Convertir la différence en secondes
    const secondsDifference = Math.floor(timeDifference / 1000);

    // Convertir les secondes en un texte descriptif
    if (secondsDifference < 60) {
      return 'now';
    } else if (secondsDifference < 3600) {
      const minutes = Math.floor(secondsDifference / 60);
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (secondsDifference < 86400) {
      const hours = Math.floor(secondsDifference / 3600);
      return ` ${hours} hr${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(secondsDifference / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };