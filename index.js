/*Copyright D8Data 2019*/

module.exports = {polyratutil,polyratmath,polyratgui};

let polyratutil =
{
    construct_descriminant_coeffients_for_root(root)
    {
        /*
            (r-1)/4 == c
        */

        let a = 1,b = -1,c=-1*((root-1)/4);
        return [a,b,c];
    },
    quadratic_addative_series(a,b,c,_i)
    {
        /*
            C:      0,          2 
            B:      1,          1
            A:      1B+0C/A,    1B+2C/A
        */

        let s1c=1,s1p=0,s2c=1,s2p=2;

        let f = (p,n) => [n,c*p+b*n/a];

        for(let i = 0; i < _i; i++)
            [s1p,s1c] = f(s1p,s1c);

        for(let i = 0; i < _i; i++)
            [s2c,s2p] = f(s2c,s2p);

        return [[s1p,s1c],[s2c,s2p]];
    },
    construct_general_root_coefficients(degree,root)
    {
        let c = new Array(degree+1).fill(0);
        c[0] = 1;
        c[c.length-1] = -1 * root;

        return c;
    },
    general_addative_series(c,_i,r)
    {
        let s1=[1,0],s2=[1,2];

        for(let i=2; i < c.length-1; i++)
            s1.push(0),s2.push(0);

        if(r)
            r(0,0,1,"(eq)^0 - (1/eq)^0"),r(0,1,2,"(eq)^1 - (1/eq)^1")

        let f = (a,_i,_c) =>
        {
            let s = 0;

            for(let i = 1; i < c.length;i++)
                s += a[i-1] * c[i];

            s/=c[0];

            if(r)
            {
                let eq = "{";

                for(let i = 1; i < c.length;i++)
                    eq += `${a[i-1]} * ${c[i]}`, eq += (i != c.length-1) ? " + " : "";

                eq += " } \\over " + c[0];

                r(_i,s,_c+2,eq);
            }

            a.unshift(s);
            a.pop();

            return a;
        };

        for(let i = 0; i < _i; i++)
            s1 = f(s1,0,i+1);

        if(r)
            r(1,2,1,"(eq)^0 + (1/eq)^0"),r(1,1,2,"(eq)^1 + (1/eq)^1")

        for(let i = 0; i < _i; i++)
            s2 = f(s2,1,i+1);

        return [s1.reverse(),s2.reverse()];
    },
    solve_quadratic(a,b,c)
    {
        //Used to validate appoximation
        let det = b*b - 4*a*c;

        if(det < 0) throw "Imaginary";

        return [((b*-1) + Math.sqrt(det))/2*a,((b*-1) - Math.sqrt(det))/2*a];
    },
    solve_quadratic_ratio_basic(a,b,c,dl)
    {
        //simple... ignore a
        if(!dl)dl=20;

        let r = [BigInt(0),BigInt(1)];

        for(let i = 0; i < dl; i++)
            r.push( b * r[r.length-1] + r[r.length-2] * c);

        return r;
    },
};

let polyratmath =
{
    root_as_ratio(root,iteration)
    {
        /*
            Problem:

            We need a way of finding the coefficient to a quadratic equation where b squared +- a multiple of 4 equals our root.
            Or it could also be the multiple of a square and our root.
            Or Our root and another root we already know.
        */

        /*
            Solution:

            (r-1)/4 == c
        */

        let [a,b,c] = rationalutil.construct_descriminant_coeffients_for_root(root);

        return rationalutil.quadratic_addative_series(a,Math.abs(b),Math.abs(c),iteration);
    },
    polynomial_solution(c,i,abs)
    {
        if(abs) c = c.map((i)=>Math.abs(i));
        let r = rationalutil.general_addative_series(c,i);
        return r[0][r[0].length-1] / r[0][r[0].length-2];
    },
    degreed_root(d,r,i)
    {
        let e = new datamath.function_base(1,rationalutil.construct_general_root_coefficients(d,r)).rebase(-1);
        return rationalutil.general_addative_series(e.coefficients.map((l,i)=>(i)?l*-1:l),i);
    }
};

let polyratgui = 
{
    addative(c,b,_i,eqa,en)
    {
        b = b.map((i)=>Math.abs(i));
        if (typeof c === 'string')
            c = document.getElementById(c);

        c.className = 'gvt gsc';
        c.innerHTML = "";
        c.style.setProperty('--gc', `repeat(${(!en)?((eqa)?4:3):((eqa)?3:2)},auto)`);
        c.style.setProperty('--gar', `repeat(${_i*2+6},auto)`);
        let nd = () => c.appendChild(document.createElement("div"))

        if(!en)nd().innerHTML = "Mode";
        nd().innerHTML = "Index";
        nd().innerHTML = "Value";
        if(eqa)nd().innerHTML = "Equation";

        rationalutil.general_addative_series(b,_i,(m,d,i,s)=>
        {
            if(en && en-1 != m)
                return;

            if(!en)nd().innerHTML = (m) ? 'Aux' : 'Main';
            nd().innerHTML = i;
            nd().innerHTML = d;
            if(eqa)datagui.equation(nd(),s);
        });
    }
};

//# sourceURL=rationalmath.js