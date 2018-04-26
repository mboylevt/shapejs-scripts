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
        rangeMin: 0.1,
        rangeMax: 5,
        step: 0.1,
        defaultVal: 1.,
        unit: "MM"
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
        name: "voxelSize",
        desc: "Voxel Size",
        type: "double",
        rangeMin: 0.01,
        rangeMax: 1,
        step: 0.01,
        defaultVal: 0.2,
        unit: "MM"
    },
    {
        name: "material",
        desc: "Material",
        type: "enum",
        values: ["FCS"],
        defaultVal: "FCS"
    }
];

function extendPoint(start,dir,dist) {
    var edir = new Vector3d(dir);
    edir.scale(dist);
    edir.add(start);

    return edir;
}

var vs = 0.2*MM;
function main(args) {
	
	var vs = args.voxelSize;
	
    var maxDist = 4*args.thickness + vs;
    var loader = new ModelLoader(args.model);
    loader.setVoxelSize(vs);
    loader.setMaxInDistance(maxDist);
    loader.setMaxOutDistance(maxDist);
    loader.setAttributeLoading(true);
    loader.setDistanceBitCount(16);
    loader.setMargins(1*MM);

    //var mesh = loader.getMesh();
    var base = new DataSourceGrid(loader);
    //var bounds = mesh.getBounds();
    var bounds = loader.getGridBounds();

    var wt = args.thickness;
    var result = new Add(new Abs(new Add(base, new Constant(wt/2))), new Constant(-wt/2));

    if (typeof args.hole1 !== 'undefined') {
        var pos = args.hole1.point;
        var n = args.hole1.normal;

        var start = new Vector3d(pos);
        var end = extendPoint(start,n,3*wt);
        n.negate();
        var start = extendPoint(start,n,3*wt);

        var exit = new Cylinder(start, end,args.holeSize/2);
        result = new Subtraction(result,exit);
        //result = new Union(result,exit);
    }

    /*
    if (loader.getMaterialType() == "COLOR_MATERIAL") {
        result = new DataSourceMixer(result,new Constant(1,1,1));
    }
    */
    var scene = new Scene(result,bounds,vs);
    scene.setName("Hollow");
    //scene.setMaterialType(loader.getMaterialType());

    return scene;
}
