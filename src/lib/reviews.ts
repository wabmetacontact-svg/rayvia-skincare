export type Review = {
  id: number;
  name: string;
  location: string;
  rating: number;
  product: string;
  title: string;
  comment: string;
  date: string;
  initials: string;
};

export const reviews: Review[] = [
  {
    id: 1,
    name: "Aarav Sharma",
    location: "Mumbai, IN",
    rating: 5,
    product: "Glow Renew De-Tan Scrub",
    title: "Genuinely worked on my tan!",
    comment:
      "I've tried so many scrubs but this is the first one that actually removed my sun tan. My skin looks visibly brighter after just 2 uses. The texture is luxurious and not harsh at all.",
    date: "2 weeks ago",
    initials: "AS",
  },
  {
    id: 2,
    name: "Priya Nair",
    location: "Bangalore, IN",
    rating: 5,
    product: "Even Tone De-Tan Serum",
    title: "Holy grail serum for uneven tone",
    comment:
      "Been using this for 3 weeks and my dark spots have faded significantly. Lightweight, absorbs fast and doesn't break me out. Worth every rupee.",
    date: "1 month ago",
    initials: "PN",
  },
  {
    id: 3,
    name: "Rohan Mehta",
    location: "Delhi, IN",
    rating: 4,
    product: "Radiance De-Tan Face Pack",
    title: "Instant glow in 10 minutes",
    comment:
      "Used it before a wedding and my skin looked radiant immediately. Cooling and refreshing. Only wish it came in a bigger size!",
    date: "3 weeks ago",
    initials: "RM",
  },
  {
    id: 4,
    name: "Sneha Reddy",
    location: "Hyderabad, IN",
    rating: 5,
    product: "Glow Renew De-Tan Scrub",
    title: "Perfect for sensitive skin",
    comment:
      "I have super sensitive skin and most scrubs irritate me. This one is gentle yet effective. No redness, just soft glowing skin.",
    date: "1 week ago",
    initials: "SR",
  },
  {
    id: 5,
    name: "Karan Patel",
    location: "Ahmedabad, IN",
    rating: 5,
    product: "Even Tone De-Tan Serum",
    title: "Great for men too",
    comment:
      "Bought this for my wife and ended up using it myself. My skin tone has evened out a lot. The packaging is premium and feels luxurious.",
    date: "2 months ago",
    initials: "KP",
  },
  {
    id: 6,
    name: "Ananya Iyer",
    location: "Chennai, IN",
    rating: 5,
    product: "Radiance De-Tan Face Pack",
    title: "My weekly ritual now",
    comment:
      "This face pack has become a staple in my skincare routine. It detoxifies and brightens without drying. The clay is so smooth and luxurious.",
    date: "1 month ago",
    initials: "AI",
  },
];
