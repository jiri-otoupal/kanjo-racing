function gps2m(lat_a, lng_a, lat_b, lng_b) {
    const pk = (180 / 3.14169);

    const a1 = lat_a / pk;
    const a2 = lng_a / pk;
    const b1 = lat_b / pk;
    const b2 = lng_b / pk;

    const t1 = Math.cos(a1) * Math.cos(a2) * Math.cos(b1) * Math.cos(b2);
    const t2 = Math.cos(a1) * Math.sin(a2) * Math.cos(b1) * Math.sin(b2);
    const t3 = Math.sin(a1) * Math.sin(b1);
    const tt = Math.acos(t1 + t2 + t3);

    return 6366000 * tt;
}

export default gps2m;