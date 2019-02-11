
let _Math = {
    DEG2RAD: Math.PI / 180,
    RAD2DEG: 180 / Math.PI,
}

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    divideScalar(scalar) {
        return this.multiplyScalar(1 / scalar);
    }

    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    // 标准化向量，长度为1
    normalize() {
        return this.divideScalar(this.length() || 1);
    }

    // 反转向量
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }
}

class Matrix4 {
    constructor() {
        this.elements = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ];
    }

    set(n11, n12, n13, n14, n21, n22, n23, n24, n31, n32, n33, n34, n41, n42, n43, n44) {
        let te = this.elements;

        te[0] = n11;te[1] = n12;te[2] =  n13;te[3] = n14;
        te[4] = n21;te[5] = n22;te[6] =  n23;te[7] = n24;
        te[8] = n31;te[9] = n32;te[10] = n33;te[11] = n34;
        te[12] = n41;te[13] = n42;te[14] = n43;te[15] = n44;

        return this;
    }

    rotationX(theta) {
        let s = Math.sin(theta), c = Math.cos(theta);

        this.set(
            1, 0, 0, 0,
            0, c, -s, 0,
            0, s, c, 0,
            0, 0, 0, 1
        );

        return this;
    }

    rotationY(theta) {
        let s = Math.sin(theta), c = Math.cos(theta);

        this.set(
            c, 0, s, 0,
            0, 1, 0, 0,
            -s, 0, c, 0,
            0, 0, 0, 1
        );

        return this;
    }

    rotationZ(theta) {
        let s = Math.sin(theta), c = Math.cos(theta);

        this.set(
            c, -s, 0, 0,
            s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        return this;
    }
}

class Euler {
    constructor(x = 0, y = 0, z = 0, order = Euler.DefaultOrder) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order;
    }

    set(x, y, z, order) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._order = order || this._order;

        this.onChangeCallback();

        return this;
    }

    clone() {
        return new this.constructor(this._x, this._y, this._z, this._order);
    }

    copy(euler) {
        this._x = euler._x;
        this._y = euler._y;
        this._z = euler._z;
        this._order = euler._order;

        this.onChangeCallback();

        return this;
    }

    /**
     * 通过Matrix4设置Euler
     * @param m
     * @param order
     * @param update
     * @returns {Euler}
     */
    setFromRotationMatrix(m, order, update) {
        let clamp = _Math.clamp;

        // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

        let te = m.elements;
        let m11 = te[0], m12 = te[4], m13 = te[8];
        let m21 = te[1], m22 = te[5], m23 = te[9];
        let m31 = te[2], m32 = te[6], m33 = te[10];

        order = order || this._order;

        if (order === 'XYZ') {

            this._y = Math.asin(clamp(m13, -1, 1));

            if (Math.abs(m13) < 0.99999) {

                this._x = Math.atan2(-m23, m33);
                this._z = Math.atan2(-m12, m11);

            } else {

                this._x = Math.atan2(m32, m22);
                this._z = 0;

            }

        } else if (order === 'YXZ') {

            this._x = Math.asin(-clamp(m23, -1, 1));

            if (Math.abs(m23) < 0.99999) {

                this._y = Math.atan2(m13, m33);
                this._z = Math.atan2(m21, m22);

            } else {

                this._y = Math.atan2(-m31, m11);
                this._z = 0;

            }

        } else if (order === 'ZXY') {

            this._x = Math.asin(clamp(m32, -1, 1));

            if (Math.abs(m32) < 0.99999) {

                this._y = Math.atan2(-m31, m33);
                this._z = Math.atan2(-m12, m22);

            } else {

                this._y = 0;
                this._z = Math.atan2(m21, m11);

            }

        } else if (order === 'ZYX') {

            this._y = Math.asin(-clamp(m31, -1, 1));

            if (Math.abs(m31) < 0.99999) {

                this._x = Math.atan2(m32, m33);
                this._z = Math.atan2(m21, m11);

            } else {

                this._x = 0;
                this._z = Math.atan2(-m12, m22);

            }

        } else if (order === 'YZX') {

            this._z = Math.asin(clamp(m21, -1, 1));

            if (Math.abs(m21) < 0.99999) {

                this._x = Math.atan2(-m23, m22);
                this._y = Math.atan2(-m31, m11);

            } else {

                this._x = 0;
                this._y = Math.atan2(m13, m33);

            }

        } else if (order === 'XZY') {

            this._z = Math.asin(-clamp(m12, -1, 1));

            if (Math.abs(m12) < 0.99999) {

                this._x = Math.atan2(m32, m22);
                this._y = Math.atan2(m13, m11);

            } else {

                this._x = Math.atan2(-m23, m33);
                this._y = 0;

            }

        } else {

            console.warn('THREE.Euler: .setFromRotationMatrix() given unsupported order: ' + order);

        }

        this._order = order;

        if (update !== false) this.onChangeCallback();

        return this;

    }

    /**
     * 通过Quaternion设置Euler
     * @param q
     * @param order
     * @param update
     * @returns {Quaternion}
     */
    setFromQuaternion(q, order, update) {
        matrix.makeRotationFromQuaternion(q);
        return this.setFromRotationMatrix(matrix, order, update);
    }

    onChange(callback) {
        this.onChangeCallback = callback;

        return this;
    }

    onChangeCallback() {
    }
}

class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;
    }

    set(x, y, z, w) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._w = w;

        this.onChangeCallback();

        return this;
    }

    clone() {
        return new this.constructor(this._x, this._y, this._z, this._w);
    }

    copy(quaternion) {
        this._x = quaternion._x;
        this._y = quaternion._y;
        this._z = quaternion._z;
        this._w = quaternion._w;

        this.onChangeCallback();

        return this;
    }

    /**
     * 从欧拉角设置Quaternion
     * @param euler
     * @param update
     * @returns {Quaternion}
     */
    setFromEuler(euler, update) {
        if (!(euler && euler.isEuler)) {
            throw new Error('THREE.Quaternion: .setFromEuler() now expects an Euler rotation rather than a Vector3 and order.');
        }

        let x = euler._x, y = euler._y, z = euler._z, order = euler._order;

        let cos = Math.cos;
        let sin = Math.sin;

        let c1 = cos(x / 2);
        let c2 = cos(y / 2);
        let c3 = cos(z / 2);

        let s1 = sin(x / 2);
        let s2 = sin(y / 2);
        let s3 = sin(z / 2);

        if (order === 'XYZ') {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === 'YXZ') {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        } else if (order === 'ZXY') {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === 'ZYX') {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        } else if (order === 'YZX') {
            this._x = s1 * c2 * c3 + c1 * s2 * s3;
            this._y = c1 * s2 * c3 + s1 * c2 * s3;
            this._z = c1 * c2 * s3 - s1 * s2 * c3;
            this._w = c1 * c2 * c3 - s1 * s2 * s3;
        } else if (order === 'XZY') {
            this._x = s1 * c2 * c3 - c1 * s2 * s3;
            this._y = c1 * s2 * c3 - s1 * c2 * s3;
            this._z = c1 * c2 * s3 + s1 * s2 * c3;
            this._w = c1 * c2 * c3 + s1 * s2 * s3;
        }

        if (update !== false) this.onChangeCallback();

        return this;

    }

    /**
     * 从轴和角度设置Quaternion
     * @param axis
     * @param angle
     * @returns {Quaternion}
     */
    setFromAxisAngle(axis, angle) {
        let halfAngle = angle / 2, s = Math.sin(halfAngle);

        this._x = axis._x * s;
        this._y = axis._y * s;
        this._z = axis._z * s;
        this._w = Math.cos(halfAngle);

        this.onChangeCallback();

        return this;
    }

    /**
     * 从Matrix4设置Quaternion
     * @param m
     * @returns {Quaternion}
     */
    setFromRotationMatrix(m) {
        let te = m.elements,

            m11 = te[0], m12 = te[4], m13 = te[8],
            m21 = te[1], m22 = te[5], m23 = te[9],
            m31 = te[2], m32 = te[6], m33 = te[10],

            trace = m11 + m22 + m33, s;
        if (trace > 0) {
            s = 0.5 / Math.sqrt(trace + 1.0);

            this._w = 0.25 / s;
            this._x = (m32 - m23) * s;
            this._y = (m13 - m31) * s;
            this._z = (m21 - m12) * s;
        } else if (m11 > m22 && m11 > m33) {
            s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

            this._w = (m32 - m23) / s;
            this._x = 0.25 * s;
            this._y = (m12 + m21) / s;
            this._z = (m13 + m31) / s;
        } else if (m22 > m33) {
            s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

            this._w = (m13 - m31) / s;
            this._x = (m12 + m21) / s;
            this._y = 0.25 * s;
            this._z = (m23 + m32) / s;
        } else {
            s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

            this._w = (m21 - m12) / s;
            this._x = (m13 + m31) / s;
            this._y = (m23 + m32) / s;
            this._z = 0.25 * s;
        }

        this.onChangeCallback();

        return this;
    }

    onChange(callback) {
        this.onChangeCallback = callback;

        return this;
    }

    onChangeCallback() {
    }
}

Object.defineProperties(Euler.prototype,{
    x: {
        get: function () {
            return this._x;
        },

        set: function ( value ) {
            this._x = value;
            this.onChangeCallback();
        }
    },

    y: {
        get: function () {
            return this._y;
        },

        set: function ( value ) {
            this._y = value;
            this.onChangeCallback();
        }
    },

    z: {
        get: function () {
            return this._z;
        },

        set: function ( value ) {
            this._z = value;
            this.onChangeCallback();
        }
    },

    order: {
        get: function () {
            return this._order;
        },

        set: function ( value ) {
            this._order = value;
            this.onChangeCallback();
        }
    }
});

Euler.RotationOrders = ['XYZ', 'YZX', 'ZXY', 'XZY', 'YXZ', 'ZYX'];

Euler.DefaultOrder = 'XYZ';

Object.defineProperties(Quaternion.prototype, {
    x: {
        get: function () {
            return this._x;
        },

        set: function (value) {
            this._x = value;
            this.onChangeCallback();
        }
    },
    y: {
        get: function () {
            return this._y;
        },

        set: function (value) {
            this._y = value;
            this.onChangeCallback();
        }
    },
    z: {
        get: function () {
            return this._z;
        },

        set: function (value) {
            this._z = value;
            this.onChangeCallback();
        }
    },
    w: {
        get: function () {
            return this._w;
        },

        set: function (value) {
            this._w = value;
            this.onChangeCallback();
        }
    },
});

const ColorKeywords={'aliceblue':0xF0F8FF,'antiquewhite':0xFAEBD7,'aqua':0x00FFFF,'aquamarine':0x7FFFD4,'azure':0xF0FFFF,'beige':0xF5F5DC,'bisque':0xFFE4C4,'black':0x000000,'blanchedalmond':0xFFEBCD,'blue':0x0000FF,'blueviolet':0x8A2BE2,'brown':0xA52A2A,'burlywood':0xDEB887,'cadetblue':0x5F9EA0,'chartreuse':0x7FFF00,'chocolate':0xD2691E,'coral':0xFF7F50,'cornflowerblue':0x6495ED,'cornsilk':0xFFF8DC,'crimson':0xDC143C,'cyan':0x00FFFF,'darkblue':0x00008B,'darkcyan':0x008B8B,'darkgoldenrod':0xB8860B,'darkgray':0xA9A9A9,'darkgreen':0x006400,'darkgrey':0xA9A9A9,'darkkhaki':0xBDB76B,'darkmagenta':0x8B008B,'darkolivegreen':0x556B2F,'darkorange':0xFF8C00,'darkorchid':0x9932CC,'darkred':0x8B0000,'darksalmon':0xE9967A,'darkseagreen':0x8FBC8F,'darkslateblue':0x483D8B,'darkslategray':0x2F4F4F,'darkslategrey':0x2F4F4F,'darkturquoise':0x00CED1,'darkviolet':0x9400D3,'deeppink':0xFF1493,'deepskyblue':0x00BFFF,'dimgray':0x696969,'dimgrey':0x696969,'dodgerblue':0x1E90FF,'firebrick':0xB22222,'floralwhite':0xFFFAF0,'forestgreen':0x228B22,'fuchsia':0xFF00FF,'gainsboro':0xDCDCDC,'ghostwhite':0xF8F8FF,'gold':0xFFD700,'goldenrod':0xDAA520,'gray':0x808080,'green':0x008000,'greenyellow':0xADFF2F,'grey':0x808080,'honeydew':0xF0FFF0,'hotpink':0xFF69B4,'indianred':0xCD5C5C,'indigo':0x4B0082,'ivory':0xFFFFF0,'khaki':0xF0E68C,'lavender':0xE6E6FA,'lavenderblush':0xFFF0F5,'lawngreen':0x7CFC00,'lemonchiffon':0xFFFACD,'lightblue':0xADD8E6,'lightcoral':0xF08080,'lightcyan':0xE0FFFF,'lightgoldenrodyellow':0xFAFAD2,'lightgray':0xD3D3D3,'lightgreen':0x90EE90,'lightgrey':0xD3D3D3,'lightpink':0xFFB6C1,'lightsalmon':0xFFA07A,'lightseagreen':0x20B2AA,'lightskyblue':0x87CEFA,'lightslategray':0x778899,'lightslategrey':0x778899,'lightsteelblue':0xB0C4DE,'lightyellow':0xFFFFE0,'lime':0x00FF00,'limegreen':0x32CD32,'linen':0xFAF0E6,'magenta':0xFF00FF,'maroon':0x800000,'mediumaquamarine':0x66CDAA,'mediumblue':0x0000CD,'mediumorchid':0xBA55D3,'mediumpurple':0x9370DB,'mediumseagreen':0x3CB371,'mediumslateblue':0x7B68EE,'mediumspringgreen':0x00FA9A,'mediumturquoise':0x48D1CC,'mediumvioletred':0xC71585,'midnightblue':0x191970,'mintcream':0xF5FFFA,'mistyrose':0xFFE4E1,'moccasin':0xFFE4B5,'navajowhite':0xFFDEAD,'navy':0x000080,'oldlace':0xFDF5E6,'olive':0x808000,'olivedrab':0x6B8E23,'orange':0xFFA500,'orangered':0xFF4500,'orchid':0xDA70D6,'palegoldenrod':0xEEE8AA,'palegreen':0x98FB98,'paleturquoise':0xAFEEEE,'palevioletred':0xDB7093,'papayawhip':0xFFEFD5,'peachpuff':0xFFDAB9,'peru':0xCD853F,'pink':0xFFC0CB,'plum':0xDDA0DD,'powderblue':0xB0E0E6,'purple':0x800080,'rebeccapurple':0x663399,'red':0xFF0000,'rosybrown':0xBC8F8F,'royalblue':0x4169E1,'saddlebrown':0x8B4513,'salmon':0xFA8072,'sandybrown':0xF4A460,'seagreen':0x2E8B57,'seashell':0xFFF5EE,'sienna':0xA0522D,'silver':0xC0C0C0,'skyblue':0x87CEEB,'slateblue':0x6A5ACD,'slategray':0x708090,'slategrey':0x708090,'snow':0xFFFAFA,'springgreen':0x00FF7F,'steelblue':0x4682B4,'tan':0xD2B48C,'teal':0x008080,'thistle':0xD8BFD8,'tomato':0xFF6347,'turquoise':0x40E0D0,'violet':0xEE82EE,'wheat':0xF5DEB3,'white':0xFFFFFF,'whitesmoke':0xF5F5F5,'yellow':0xFFFF00,'yellowgreen':0x9ACD32};

/**
 * 颜色可以用以下任意一种方式初始化
 * let color = new THREE.Color();
 * let color = new THREE.Color(0xff0000);
 * let color = new THREE.Color("rgb(255, 0, 0)");
 * let color = new THREE.Color("rgb(100%, 0%, 0%)");
 * let color = new THREE.Color("skyblue");
 * let color = new THREE.Color("hsl(0, 100%, 50%)");
 * let color = new THREE.Color(1, 0, 0);
 */

class Color {
    constructor(r, g, b) {
        this.r = 1;
        this.g = 1;
        this.b = 1;
        if (g === undefined && b === undefined) {
            return this.set(r);
        }

        return this.setRGB(r, g, b);
    }

    clone() {
        return new this.constructor(this.r, this.g, this.b);
    }

    copy(color) {
        this.r = color.r;
        this.g = color.g;
        this.b = color.b;
        return this;
    }

    set(value) {
        if (value && value.isColor) {
            this.copy(value);
        } else if (typeof value === 'number') {
            this.setHex(value);
        } else if (typeof value === 'string') {
            this.setStyle(value);
        }

        return this;
    }

    setHex(hex) {
        hex = Math.floor(hex);

        this.r = (hex >> 16 & 255) / 255;
        this.g = (hex >> 8 & 255) / 255;
        this.b = (hex & 255) / 255;

        return this;
    }

    setRGB(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;

        return this;
    }

    setHSL(h, s, l) {
        // h,s,l ranges are in 0.0 - 1.0
        h = _Math.euclideanModulo(h, 1);
        s = _Math.clamp(s, 0, 1);
        l = _Math.clamp(l, 0, 1);

        if (s === 0) {
            this.r = this.g = this.b = l;
        } else {
            let p = l <= 0.5 ? l * (1 + s) : l + s - (l * s);
            let q = (2 * l) - p;

            this.r = this._hue2rgb(q, p, h + 1 / 3);
            this.g = this._hue2rgb(q, p, h);
            this.b = this._hue2rgb(q, p, h - 1 / 3);

        }
        return this;
    }

    setStyle(style) {
        let m;
        if (m = /^((?:rgb|hsl)a?)\(\s*([^\)]*)\)/.exec(style)) {
            // rgb / hsl
            let color;
            let name = m[1];
            let components = m[2];

            switch (name) {
                case 'rgb':
                case 'rgba':
                    if (color = /^(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
                        // rgb(255,0,0) rgba(255,0,0,0.5)
                        this.r = Math.min(255, parseInt(color[1], 10)) / 255;
                        this.g = Math.min(255, parseInt(color[2], 10)) / 255;
                        this.b = Math.min(255, parseInt(color[3], 10)) / 255;

                        return this;
                    }
                    if (color = /^(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
                        // rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)
                        this.r = Math.min(100, parseInt(color[1], 10)) / 100;
                        this.g = Math.min(100, parseInt(color[2], 10)) / 100;
                        this.b = Math.min(100, parseInt(color[3], 10)) / 100;

                        return this;
                    }
                    break;
                case 'hsl':
                case 'hsla':
                    if (color = /^([0-9]*\.?[0-9]+)\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(,\s*([0-9]*\.?[0-9]+)\s*)?$/.exec(components)) {
                        // hsl(120,50%,50%) hsla(120,50%,50%,0.5)
                        let h = parseFloat(color[1]) / 360;
                        let s = parseInt(color[2], 10) / 100;
                        let l = parseInt(color[3], 10) / 100;

                        return this.setHSL(h, s, l);
                    }
                    break;
            }
        } else if (m = /^\#([A-Fa-f0-9]+)$/.exec(style)) {
            // hex color
            let hex = m[1];
            let size = hex.length;

            if (size === 3) {
                // #ff0
                this.r = parseInt(hex.charAt(0) + hex.charAt(0), 16) / 255;
                this.g = parseInt(hex.charAt(1) + hex.charAt(1), 16) / 255;
                this.b = parseInt(hex.charAt(2) + hex.charAt(2), 16) / 255;

                return this;
            } else if (size === 6) {
                // #ff0000
                this.r = parseInt(hex.charAt(0) + hex.charAt(1), 16) / 255;
                this.g = parseInt(hex.charAt(2) + hex.charAt(3), 16) / 255;
                this.b = parseInt(hex.charAt(4) + hex.charAt(5), 16) / 255;

                return this;
            }
        }

        if (style && style.length > 0) {
            let hex = ColorKeywords[style];
            if (hex !== undefined) {
                this.setHex(hex);
            } else {
                console.warn('XCANVAS.Color: Unknown color ' + style);
            }
        }
        return this;
    }

    getHex() {
        return (this.r * 255) << 16 ^ (this.g * 255) << 8 ^ (this.b * 255) << 0;
    }

    getHexString() {
        return ('000000' + this.getHex().toString(16)).slice(-6);
    }

    getHSL(target) {
        // h,s,l ranges are in 0.0 - 1.0
        if (target === undefined) {
            console.warn('XCANVAS.Color: .getHSL() target is now required');
            target = {
                h: 0,
                s: 0,
                l: 0
            };
        }
        let r = this.r,
            g = this.g,
            b = this.b;
        let max = Math.max(r, g, b);
        let min = Math.min(r, g, b);
        let hue, saturation;
        let lightness = (min + max) / 2.0;
        if (min === max) {
            hue = 0;
            saturation = 0;
        } else {
            let delta = max - min;
            saturation = lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);
            switch (max) {
                case r:
                    hue = (g - b) / delta + (g < b ? 6 : 0);
                    break;
                case g:
                    hue = (b - r) / delta + 2;
                    break;
                case b:
                    hue = (r - g) / delta + 4;
                    break;
            }
            hue /= 6;
        }
        target.h = hue;
        target.s = saturation;
        target.l = lightness;
        return target;
    }

    getStyle() {
        return 'rgb(' + ((this.r * 255) | 0) + ',' + ((this.g * 255) | 0) + ',' + ((this.b * 255) | 0) + ')';
    }

    add(color) {
        this.r += color.r;
        this.g += color.g;
        this.b += color.b;
        return this;
    }

    sub(color) {
        this.r = Math.max(0, this.r - color.r);
        this.g = Math.max(0, this.g - color.g);
        this.b = Math.max(0, this.b - color.b);
        return this;
    }

    multiply(color) {
        this.r *= color.r;
        this.g *= color.g;
        this.b *= color.b;

        return this;
    }

    equals(c) {
        return (c.r === this.r) && (c.g === this.g) && (c.b === this.b) && (c.a === this.a);
    }

    _hue2rgb(p, q, t) {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
        return p;
    }
}

class Object3D {
    constructor(){
        this.parent = null;
        this.children = [];

        this.position = new Vector3();
        this.rotation = new Euler();
        this.quaternion = new Quaternion();
        this.scale = new Vector3(1, 1, 1);

        this.up = Object3D.DefaultUp.clone();

        this.matrix = new Matrix4();        // 局部变换（相对于父级的变换）
        this.matrixWorld = new Matrix4();   // 全局变换（用于最终的显示）

        // rotation改变后自动更新quaternion
        this.rotation.onChange(() => {
            this.quaternion.setFromEuler(this.rotation, false);
        });

        // quaternion改变后自动更新rotation
        this.quaternion.onChange(() => {
            this.rotation.setFromQuaternion(this.quaternion, undefined, false);
        });
    }

    add(object) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                this.add(arguments[i]);
            }
        }

        if (object === this) {
            console.error("THREE.Object3D.add: object can't be added as a child of itself.", object);
            return this;
        }

        if ((object && object.isObject3D)) {
            if (object.parent !== null) {
                object.parent.remove(object);
            }

            object.parent = this;

            this.children.push(object);

        } else {
            console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", object);
        }

        return this;
    }

    remove(object) {
        if (arguments.length > 1) {
            for (let i = 0; i < arguments.length; i++) {
                this.remove(arguments[i]);
            }

            return this;
        }

        let index = this.children.indexOf(object);

        if (index !== -1) {
            object.parent = null;

            object.dispatchEvent({type: 'removed'});
            this.children.splice(index, 1);
        }

        return this;

    }

    lookAt(v) {
        target.copy(v);

        position.setFromMatrixPosition(this.matrix);

        if (this.isCamera) {
            m1.lookAt(position, target, this.up);
        } else {
            m1.lookAt(target, position, this.up);
        }

        // 获取quaternion
        this.quaternion.setFromRotationMatrix(m1);
    }

    // 遍历对象
    traverse(callback) {
        callback(this);

        let children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {
            children[i].traverse(callback);
        }
    }
}

Object3D.DefaultUp = new Vector3(0, 1, 0);
Object3D.DefaultMatrixAutoUpdate = true;

// 顶点缓存。（使用一个BufferAttribute来存储所有的顶点数据，当需要矩阵运算时传入矩阵。矩阵只需要一个，避免声明多个Vector3来存储顶点）
class BufferAttribute {
    constructor(array, itemSize) {
        this.array = array;
        this.itemSize = itemSize;
    }
}

class Float32BufferAttribute extends BufferAttribute {
    constructor(array, itemSize) {
        super(new Float32Array(array), itemSize);
    }
}

class BufferGeometry {
    constructor(){
        this.attributes = {}; // 缓存属性（position,nomal,uv,color等类型数组）
    }

    addAttribute(name, attribute) {
        this.attributes[name] = attribute;
        return this;
    }

    getAttribute(name) {
        return this.attributes[name];
    }

    removeAttribute(name) {
        delete this.attributes[name];
        return this;
    }
}

class Texture{
    constructor(image = undefined) {
        this.image = image;
    }
}

// 图片加载器
class ImageLoader {
    load(url, onLoad) {
        let image = new Image();
        image.addEventListener('load', function () {
            if (onLoad !== undefined) {
                onLoad(this);
            }
        }, false);
        image.src = url;
        return image;
    }
}

class TextureLoader {
    load(url, onLoad) {
        let texture = new Texture();

        let loader = new ImageLoader();
        loader.load(url, function (image) {
            texture.image = image;

            if (onLoad !== undefined) {
                onLoad(texture);
            }
        });

        return texture;
    }
}

class Geometry {
    constructor(){
        this.vertices = []; // 顶点
        this.colors = [];   // 顶点 colors 队列
        this.faces = [];    // 面
    }

    // 几何体变换
    applyMatrix(matrix) {
        for (let i = 0; i < this.vertices.length; i++) {
            let vertex = this.vertices[i];
            vertex.applyMatrix4(matrix);
        }

        return this;
    }
}

class BoxGeometry extends BufferGeometry{
    constructor(width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1){
        super();
        this.parameters = {
            width: width,
            height: height,
            depth: depth,
            widthSegments: widthSegments,
            heightSegments: heightSegments,
            depthSegments: depthSegments
        };

        let vertices = [];
        let normals = [];
        let uvs = [];

        buildPlane('z', 'y', 'x', -1, -1, depth, height, width, depthSegments, heightSegments, 0);  // px
        buildPlane('z', 'y', 'x', 1, -1, depth, height, -width, depthSegments, heightSegments, 1);  // nx
        buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2);     // py
        buildPlane('x', 'z', 'y', 1, -1, width, depth, -height, widthSegments, depthSegments, 3);   // ny
        buildPlane('x', 'y', 'z', 1, -1, width, height, depth, widthSegments, heightSegments, 4);   // pz
        buildPlane('x', 'y', 'z', -1, -1, width, height, -depth, widthSegments, heightSegments, 5); // nz

        this.addAttribute('position', new Float32BufferAttribute(vertices, 3));

       function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY) {

            let segmentWidth = width / gridX;
            let segmentHeight = height / gridY;

            let widthHalf = width / 2;
            let heightHalf = height / 2;
            let depthHalf = depth / 2;

            let gridX1 = gridX + 1;
            let gridY1 = gridY + 1;

            let ix, iy;

            let vector = new Vector3();

            // generate vertices, normals and uvs
            for (iy = 0; iy < gridY1; iy++) {
                let y = iy * segmentHeight - heightHalf;
                for (ix = 0; ix < gridX1; ix++) {
                    let x = ix * segmentWidth - widthHalf;

                    // set values to correct vector component
                    vector[u] = x * udir;
                    vector[v] = y * vdir;
                    vector[w] = depthHalf;

                    // now apply vector to vertex buffer
                    vertices.push(vector.x, vector.y, vector.z);

                    // set values to correct vector component
                    vector[u] = 0;
                    vector[v] = 0;
                    vector[w] = depth > 0 ? 1 : -1;
                }
            }
        }
    }
}