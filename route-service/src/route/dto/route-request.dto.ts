export class RouteRequestDto {
    start: {
        lat: number;
        lng: number;
    };

    end: {
        lat: number;
        lng: number;
    };

    via?: {
        lat: number;
        lng: number;
    }[];

}