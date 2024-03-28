export const handleShare = async (link: string) => {
    try {
        // Check if Web Share API is supported by the browser
        if (navigator.share) {
  
          // Call the share method
          await navigator.share({
            title: "Share Post",
            text: "Check out this post!",
            url: link,
          });
        } else {
          // Fallback behavior if Web Share API is not supported
          alert("Web Share API is not supported in this browser.");
        }
      } catch (error) {
        console.error("Error sharing:", error);
      }
}