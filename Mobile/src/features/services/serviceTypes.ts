export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  category: string;
  imageUrl?: string;
}

export interface ServicesState {
  items:    Service[];
  selected: Service | null;
  loading:  boolean;
  error:    string | null;
}