export interface Holiday {
    date: string;
    nom_jour_ferie: string;
}

export interface SchoolHoliday {
    description: string;
    start_date: string;
    end_date: string;
    zones: string;
    location: string;
}

export interface SchoolHolidayRecord {
    fields: {
        description: string;
        start_date: string;
        end_date: string;
        zones: string;
        location: string;
        population: string;
    };
}

export interface SchoolHolidayApiResponse {
    records: SchoolHolidayRecord[];
}
