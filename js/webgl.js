/**
 * webgl常用API封装
 */
class WebGL {
    constructor(gl) {
        this.gl = gl;   // WebGL上下文
    }

    /**
     * 初始化着色器函数
     * @param vertexShaderSource    顶点着色器
     * @param fragmentShaderSource  片元着色器
     * @returns {WebGLProgram}      程序对象
     */
    initShader(vertexShaderSource, fragmentShaderSource) {
        var gl = this.gl;

        // 创建顶点着色器和片元着色器对象
        var vertexShader = gl.createShader(gl.VERTEX_SHADER);
        var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        // 引入顶点、片元着色器源代码
        gl.shaderSource(vertexShader, vertexShaderSource);
        gl.shaderSource(fragmentShader, fragmentShaderSource);

        // 编译顶点、片元着色器
        gl.compileShader(vertexShader);
        gl.compileShader(fragmentShader);

        // 创建程序对象program
        var program = gl.createProgram();

        /** 开始合并程序 **/

        // 附着顶点着色器和片元着色器到program
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);    // 链接program
        gl.useProgram(program);     // 使用program

        return program;
    }

    /**
     * 顶点数据配置函数
     * @param data  顶点数据
     * @param index 顶点位置
     * @param size  顶点间隔
     * @param type  数据格式
     * @returns {AudioBuffer | WebGLBuffer} 缓存对象
     */
    vertexBuffer(data, index, size, type = gl.FLOAT) {
        var gl = this.gl;

        var buffer = gl.createBuffer();                         // 创建缓冲区对象
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);                 // 绑定缓冲区对象,激活buffer
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);   // 顶点数组data数据传入缓冲区
        gl.vertexAttribPointer(index, size, type, false, 0, 0); // 缓冲区中的数据按照一定的规律传递给位置变量apos
        gl.enableVertexAttribArray(index);                      // 允许数据传递
        return buffer;
    }

    /**
     * 图片纹理数据配置函数
     * @param url   图片路径
     * @param type  图片类型
     * @param callback  图片加载完成回调函数
     */
    textureBuffer(url, type, callback) {
        var gl = this.gl;

        var image = new Image();
        image.src = url;
        image.onload = function () {
            var texture = gl.createTexture();               // 创建纹理图像缓冲区
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);   // 纹理图片上下反转
            gl.activeTexture(gl.TEXTURE0);                  // 激活0号纹理单元TEXTURE0
            gl.bindTexture(gl.TEXTURE_2D, texture);         // 绑定纹理缓冲区

            // 配置纹理参数：设置纹理贴图填充方式（纹理配置有多种参数，这里使用的线性滤波）
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);  // 纹理放大方式
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);  // 纹理缩小方式

            // 配置纹理图像：设置纹素格式
            gl.texImage2D(gl.TEXTURE_2D, 0, type, type, gl.UNSIGNED_BYTE, image);

            return callback();
        };
    }
}

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

class Color {
    constructor(r = 1, g = 1, b = 1) {
        this.r = r;
        this.g = g;
        this.b = b;
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

        te[0] = n11;te[4] = n12;te[8] =  n13;te[12] = n14;
        te[1] = n21;te[5] = n22;te[9] =  n23;te[13] = n24;
        te[2] = n31;te[6] = n32;te[10] = n33;te[14] = n34;
        te[3] = n41;te[7] = n42;te[11] = n43;te[15] = n44;

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

// 顶点缓存。（使用一个BufferAttribute来存储所有的顶点数据，当需要矩阵运算时传入矩阵。矩阵只需要一个，避免声明多个矩阵来存储顶点）
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
