class Coordinate {
    constructor(view, VIZCore) {
        this.scope = this;
        this.view = view;
        this.VIZCore = VIZCore;

        this.Direction = 0; // 0(X = lat, Y = lon) 1(X = lon, Y = lat)

        this.Base = {
            ratio : {
                latitude : 1,
                longitude : 1,
                x : 1,
                y : 1,
            },
            coordinate : {
                latitude : 1,
                longitude : 1,
                x : 1,
                y : 1,
            }
        }
    }

    // 기준 좌표 설정
    setStandardValue(latitude1, longitude1, x1, y1, latitude2, longitude2, x2, y2)
    {
        let lat = latitude2 - latitude1;
        let lon = longitude2 - longitude1;
        let xlength = x2 - x1;
        let ylength = y2 - y1;
        
        let xr = undefined;
        let yr = undefined;
        let latr = undefined;
        let lonr = undefined;

        // 1:x = lat : xlength
        // x:1 = lat : xlength
        if(this.scope.Direction === 0)
        {
            xr = xlength / lat;
            yr = ylength / lon;

            latr = lat / xlength;
            lonr = lon / ylength;

            this.Base.ratio.latitude = xr;
            this.Base.ratio.longitude = yr;
            this.Base.ratio.x = latr;
            this.Base.ratio.y = lonr;
        }
        else if (this.scope.Direction === 1){
            xr = xlength / lon;
            yr = ylength / lat;
            latr = lat / ylength;
            lonr = lon / xlength;

            this.Base.ratio.latitude = yr;
            this.Base.ratio.longitude = xr;
            this.Base.ratio.x = lonr;
            this.Base.ratio.y = latr;
        }

        
        this.Base.coordinate.latitude = latitude1;
        this.Base.coordinate.longitude = longitude1;
        this.Base.coordinate.x = x1;
        this.Base.coordinate.y = y1;
    }

    toCartesian(latitude, longitude)
    {
        // calc
        let offset_lat = latitude - this.Base.coordinate.latitude;
        let offset_lon = longitude - this.Base.coordinate.longitude;

        let x = undefined;
        let y = undefined;
        if(this.scope.Direction === 0)
        {
             x = offset_lat * this.Base.ratio.latitude;
             y = offset_lon * this.Base.ratio.longitude;  
        }
        else if (this.scope.Direction === 1){
            x = offset_lon * this.Base.ratio.longitude;
            y = offset_lat * this.Base.ratio.latitude;
        }
        
        let result = {
            x : this.Base.coordinate.x + x,
            y : this.Base.coordinate.y + y,
            z : 0
        }
        return result;
    }

    toLatLon(x, y)
    {

         // calc
         let offset_x = x - this.Base.coordinate.x;
         let offset_y = y - this.Base.coordinate.y;
 
         let lat = undefined;
         let lon = undefined;
         if(this.scope.Direction === 0)
         {
            lat = offset_x * this.Base.ratio.x;
            lon = offset_y * this.Base.ratio.y;
         }
         else if (this.scope.Direction === 1){
            lat = offset_y * this.Base.ratio.y;
            lon = offset_x * this.Base.ratio.x;
         }
 
         let result = {
            latitude : this.Base.coordinate.latitude + lat,
            longitude : this.Base.coordinate.longitude + lon
         }
         return result;
    }
}

export default Coordinate;