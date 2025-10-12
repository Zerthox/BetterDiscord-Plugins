export interface Stories {
    title: string;
    stories: Story[];
}

export interface Story {
    id: string;
    name: string;
    component: React.ComponentType;
    controls: Record<string, Control>;
}

export interface Control {
    type: string;
    label: string;
    defaultValue?: any;
    options?: any[];
}
