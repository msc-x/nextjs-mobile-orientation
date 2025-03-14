import React, { useEffect, useRef } from 'react'
import styles from './index.module.scss'

interface AlphaVideoPlayerProps {
  videoSrc: string
  width?: number
  height?: number
  autoPlay?: boolean
  loop?: boolean
  className?: string
  onPlay?: () => void
  onError?: () => void
}

class AlphaVideo {
  private options: any
  private radio!: number
  private video!: HTMLVideoElement
  private canvas!: HTMLCanvasElement
  private gl!: WebGLRenderingContext
  private playing = false

  constructor(option: any) {
    const defaultOption = {
      src: '',
      autoplay: true,
      loop: true,
      canvas: null,
      width: 375,
      height: 300,
      onError: Function.prototype,
      onPlay: Function.prototype,
    }
    this.options = {
      ...defaultOption,
      ...option,
    }
    this.radio = window.devicePixelRatio

    this.initVideo()
    this.initWebgl()
  }

  initVideo() {
    const { onPlay, onError, loop, src } = this.options

    const video = document.createElement('video')
    video.autoplay = false
    video.muted = true
    video.playsInline = true
    video.volume = 0
    video.loop = loop
    video.style.display = 'none'
    video.crossOrigin = 'anonymous'
    
    let isInitialPlay = true;
    let playAttempts = 0;
    const maxPlayAttempts = 3;

    const attemptPlay = async () => {
      if (playAttempts >= maxPlayAttempts) {
        console.warn('Max play attempts reached');
        return;
      }

      try {
        console.log('Attempting to play video, attempt:', playAttempts + 1);
        await video.play();
        this.playing = true;
        onPlay && onPlay();
        console.log('Video playing successfully');
      } catch (error: any) {
        console.warn('Play attempt failed:', error);
        playAttempts++;
        if (error.name === 'NotAllowedError') {
          this.canvas.addEventListener('click', attemptPlay, { once: true });
        } else {
          setTimeout(attemptPlay, 1000);
        }
      }
    };

    video.addEventListener('loadedmetadata', () => {
      console.log('Video metadata loaded');
      if (this.options.autoplay && isInitialPlay) {
        attemptPlay();
      }
    });

    video.addEventListener('canplay', () => {
      console.log('Video can play');
      if (this.options.autoplay && isInitialPlay) {
        isInitialPlay = false;
        attemptPlay();
      }
    });

    video.addEventListener('play', () => {
      console.log('Video play event triggered');
      this.playing = true;
      window.requestAnimationFrame(() => {
        this.drawFrame();
      });
    });

    video.addEventListener('pause', () => {
      console.log('Video paused');
      this.playing = false;
    });

    video.addEventListener('ended', () => {
      console.log('Video ended');
      if (!loop) {
        this.playing = false;
      }
    });

    video.addEventListener('error', (e) => {
      const error = video.error;
      console.error('Video error:', {
        code: error?.code,
        message: error?.message,
        event: e
      });
      this.playing = false;
      onError && onError();
    });

    video.src = src;
    document.body.appendChild(video);
    this.video = video;
  }

  drawFrame() {
    if (!this.playing) return;
    
    try {
      this.drawWebglFrame();
      if (this.playing && !this.video.paused) {
        window.requestAnimationFrame(() => this.drawFrame());
      }
    } catch (error) {
      console.error('Error drawing frame:', error);
    }
  }

  drawWebglFrame() {
    const gl = this.gl
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.video)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
  }

  destroy() {
    this.pause().then(() => {
      if (this.video) {
        document.body.removeChild(this.video);
      }
    }).catch(console.warn);
  }

  /**
   * 初始化 WebGL 上下文和着色器程序
   * 这个方法设置了渲染 alpha 视频所需的所有 WebGL 资源
   */
  initWebgl() {
    // 设置 canvas 元素的尺寸，使用设备像素比来处理高清屏
    this.canvas = this.options.canvas
    this.canvas.width = this.options.width * this.radio
    this.canvas.height = this.options.height * this.radio
    // 添加点击事件监听器来播放视频
    this.canvas.addEventListener('click', () => {
      this.play()
    })

    // 获取 WebGL 上下文
    const gl = this.canvas.getContext('webgl')
    if (!gl) return

    // 设置视口大小，确保渲染分辨率匹配 canvas 尺寸
    gl.viewport(0, 0, this.options.width * this.radio, this.options.height * this.radio)

    // 创建并初始化着色器程序
    const program = this._initShaderProgram(gl)
    if (!program) {
      throw new Error('Failed to create shader program')
    }
    gl.linkProgram(program)
    gl.useProgram(program)

    // 初始化顶点和纹理坐标缓冲区
    const buffer = this._initBuffer(gl)

    // 设置顶点位置属性
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position)
    const aPosition = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(aPosition)
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

    // 设置纹理坐标属性
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.texture)
    const aTexCoord = gl.getAttribLocation(program, 'a_texCoord')
    gl.enableVertexAttribArray(aTexCoord)
    gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0)

    // 初始化并绑定纹理
    const texture = this._initTexture(gl)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    // 设置缩放因子（用于处理设备像素比）
    const scaleLocation = gl.getUniformLocation(program, 'u_scale')
    gl.uniform2fv(scaleLocation, [this.radio, this.radio])

    // 保存 WebGL 上下文以供后续使用
    this.gl = gl
  }

  /**
   * 创建并编译 WebGL 着色器
   * @param gl WebGL 上下文
   * @param type 着色器类型（顶点着色器或片元着色器）
   * @param source 着色器源代码
   * @returns 编译后的着色器对象，如果创建失败则返回 null
   */
  private _createShader(gl: WebGLRenderingContext, type: number, source: string) {
    // 创建着色器对象
    const shader = gl.createShader(type)
    if (!shader) return null

    // 设置着色器源代码并编译
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    
    // 检查编译状态，如果失败则输出错误信息
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(shader))
    }

    return shader
  }

  private _initShaderProgram(gl: WebGLRenderingContext) {
    const vsSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      varying vec2 v_texCoord;
      uniform vec2 u_scale;
      void main(void) {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
      }
    `
    const fsSource = `
      precision lowp float;
      varying vec2 v_texCoord;
      uniform sampler2D u_sampler;
      void main(void) {
          gl_FragColor = vec4(texture2D(u_sampler, v_texCoord).rgb, texture2D(u_sampler, v_texCoord+vec2(-0.5, 0)).r);
      }
    `
    const vsShader = this._createShader(gl, gl.VERTEX_SHADER, vsSource)
    const fsShader = this._createShader(gl, gl.FRAGMENT_SHADER, fsSource)
    if (!vsShader || !fsShader) return null

    const program = gl.createProgram()
    if (!program) return null

    gl.attachShader(program, vsShader)
    gl.attachShader(program, fsShader)
    gl.linkProgram(program)

    return program
  }

  private _initBuffer(gl: WebGLRenderingContext) {
    const positionVertice = new Float32Array([-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0])
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, positionVertice, gl.STATIC_DRAW)

    const textureBuffer = gl.createBuffer()
    const textureVertice = new Float32Array([0.5, 1.0, 1.0, 1.0, 0.5, 0.0, 1.0, 0.0])
    gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, textureVertice, gl.STATIC_DRAW)

    return {
      position: positionBuffer,
      texture: textureBuffer,
    }
  }

  private _initTexture(gl: WebGLRenderingContext) {
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    return texture
  }

  async play() {
    if (this.playing) return;
    
    try {
      await this.video.play();
      this.playing = true;
      this.drawFrame();
    } catch (error) {
      console.warn('Video play was interrupted:', error);
      this.playing = false;
    }
  }

  async pause() {
    if (!this.playing) return;

    try {
      this.playing = false;
      await this.video.pause();
    } catch (error) {
      console.warn('Video pause was interrupted:', error);
    }
  }
}

const AlphaVideoPlayer: React.FC<AlphaVideoPlayerProps> = ({
  videoSrc,
  width = 375,
  height = 300,
  autoPlay = true,
  loop = false,
  className = '',
  onPlay,
  onError,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playerRef = useRef<AlphaVideo | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      playerRef.current = new AlphaVideo({
        src: videoSrc,
        width,
        height,
        loop,
        autoplay: autoPlay,
        canvas: canvasRef.current,
        onPlay,
        onError,
      })
      console.log('playerRef.current', playerRef.current, loop)
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    }
  }, [videoSrc, width, height, loop, autoPlay, onPlay, onError])

  return (
    <div className={`${styles.container} ${className}`} style={{ width, height }}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}

export default AlphaVideoPlayer