function formatRupiah(num) {
    var p = num.toFixed(2).split(".");
    return "Rp. " + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
        return  num=="-" ? acc : num + (i && !(i % 3) ? "." : "") + acc;
    }, "");
}