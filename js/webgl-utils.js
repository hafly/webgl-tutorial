'use strict';

class WebGLUtils {
    constructor(gl) {
        this.gl = gl;
    }

    /**
     * 调整画布大小
     * @param canvas
     * @param multiplier
     * @returns {boolean}
     */
    static resizeCanvasToDisplaySize(canvas, multiplier = 1) {
        multiplier = multiplier || 1;
        const width  = canvas.clientWidth  * multiplier | 0;
        const height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width ||  canvas.height !== height) {
            canvas.width  = width;
            canvas.height = height;
            return true;
        }
        return false;
    }

    /**
     * 创建顶点/片元着色器
     * @param gl        渲染上下文
     * @param type      着色器类型
     * @param source    数据源
     */
    static loadShader(gl, type, source) {
        let shader = gl.createShader(type); // 创建着色器对象

        gl.shaderSource(shader, source);    // 提供数据源
        gl.compileShader(shader);           // 编译着色器

        // 检测编译结果
        let compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!compiled) {
            const lastError = gl.getShaderInfoLog(shader);
            console.error('*** Error compiling shader \'' + shader + '\':' + lastError);
            gl.deleteShader(shader);
            return null;
        }

        return shader;
    }

    /**
     * 初始化着色器程序。将顶点着色器和片元着色器 link（链接）到一个 program（着色程序）
     * @param gl    渲染上下文
     * @param vertexShaderSource    顶点着色器
     * @param fragmentShaderSource  片元着色器
     * @returns {WebGLProgram}      着色程序
     */
    static initShaderProgram(gl, vertexShaderSource, fragmentShaderSource) {
        let vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
        let fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

        // 创建程序对象program
        let program = gl.createProgram();

        // 附着顶点着色器和片元着色器到program
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        // 链接program
        gl.linkProgram(program);

        let linked = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (!linked) {
            const lastError = gl.getProgramInfoLog(program);
            errFn('Error in program linking:' + lastError);
            gl.deleteProgram(program);
            return null;
        }

        return program;
    }

    /**
     * 顶点数据配置函数
     * @param data  顶点数据
     * @param index 顶点属性的索引
     * @param size  指定每个顶点属性的组成数量
     * @param type  数据格式
     */
    vertexBuffer(data, index, size) {
        let gl = this.gl;
        let buffer = gl.createBuffer();                         // 创建缓冲区对象
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);                 // 绑定缓冲区对象,激活buffer
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);   // 顶点数组data数据传入缓冲区
        gl.enableVertexAttribArray(index);                      // 缓冲中获取数据给着色器中的属性
        gl.vertexAttribPointer(index, size, gl.FLOAT, false, 0, 0); // 缓冲区中的数据按照一定的规律传递给位置变量apos
    }
}