import { ReactNode } from 'react';

export interface Skill {
    name: string;
    icon: ReactNode;
}

export interface SkillCategory {
    frontend: Skill[];
    backend: Skill[];
    database: Skill[];
    devops: Skill[];
}

export interface Experience {
    title: string;
    role: string;
    period: string;
    description: string[];
    tech: string[];
}

export interface Education {
    degree: string;
    school: string;
    period: string;
    icon: ReactNode;
    level: string;
}

export interface CVData {
    skills: SkillCategory;
    experiences: Experience[];
    education: Education[];
}