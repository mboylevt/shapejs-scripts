var params = [
    {
        name: "model",
        label: "Model",
        desc: "3D Model",
        type: "uri",
        defaultVal: "urn:shapeways:stockModel:sphere"
    },
    {
        name: "thickness",
        desc: "Thickness",
        type: "double",
        rangeMin: 1,
        rangeMax: 5,
        step: 0.1,
        defaultVal: 1.5,
        unit: "MM"
    }
    ,
    {
        name: "landing",
        label: "Text Landing",
        desc: "Text Landing",
        type: "enum",
        values: ["Soap Box","Pedestal","Sign","Comic Bubble"],
        defaultVal: "Soap Box"
    },
    {
        name: "landingPosition",
        label: "Landing Position",
        desc: "Landing Position",
        type: "Location"
    },
    {
        name: "hole1",
        label: "Hole Position1",
        desc: "Hole Position1",
        type: "Location"
    },
    {
        name: "holeSize",
        desc: "Hole Size",
        type: "double",
        rangeMin: 2,
        rangeMax: 20,
        step: 0.1,
        defaultVal: 2,
        unit: "MM"
    },
    {
        name: "material",
        desc: "Material",
        type: "enum",
        //values: ["None","WSF","Stainless","WSFP","White"],
        defaultVal: "White"
    }
];
var baseURL="https://dl.dropboxusercontent.com/u/42302935/";
var landingURLS = {
    "Soap Box" : baseURL + "box.zip"
};
function extendPoint(start,dir,dist) {
    var edir = new Vector3d(dir);
    edir.scale(dist);
    edir.add(start);
    return edir;
}
var vs =0.5*MM;
function main(args) {
    var maxDist = 2*args.thickness + vs;
    var loader = new ModelLoader(args.model);
    loader.setVoxelSize(vs);
    loader.setMaxInDistance(maxDist);
    loader.setMaxOutDistance(maxDist);
    loader.setAttributeLoading(true);
    loader.setDistanceBitCount(16);
    loader.setMargins(2*vs);
    var mesh = loader.getMesh();
    var base = new DataSourceGrid(loader);
    var bounds = mesh.getBounds();
    var wt = args.thickness;
    var result = new Add(new Abs(base), new Constant(-wt/2));
    if (typeof args.landingPosition !== 'undefined') {
        var lurl = landingURLS[args.landing]
        var ll = new ModelLoader(lurl);
        ll.setVoxelSize(vs);
        ll.setMaxInDistance(maxDist);
        ll.setMaxOutDistance(maxDist);
        ll.setAttributeLoading(true);
        ll.setDistanceBitCount(16);
        ll.setMargins(2*vs);
        var lmesh = ll.getMesh();
        var lgrid = new DataSourceGrid(ll);
        lgrid = new Add(new Abs(lgrid), new Constant(-wt/2));
        var lbounds = lmesh.getBounds();
        bounds.expand(lbounds.getSizeMax());
        var trans = new CompositeTransform();
        var pos = new Vector3d(args.landingPosition.point);
        pos.y += lbounds.ymin + wt + vs;
        trans.add(new Translation(pos));
        lgrid.setTransform(trans);
        result = new Composition(Composition.AoverB,result,lgrid);
    }
    if (typeof args.hole1 !== 'undefined') {
        var pos = args.hole1.point;
        var n = args.hole1.normal;
        var start = new Vector3d(pos);
        var end = extendPoint(start,n,2*wt);
        n.negate();
        var start = extendPoint(start,n,2*wt);
        var exit = new Cylinder(start, end,args.holeSize);
        result = new Subtraction(result,exit);
        //result = new Union(result,exit);
    }
    bounds.expand(40*vs);
    var scene = new Scene(result,bounds,vs);
    scene.setName("Hollow");
    scene.setMaterialType(loader.getMaterialType());
    return scene;
}
