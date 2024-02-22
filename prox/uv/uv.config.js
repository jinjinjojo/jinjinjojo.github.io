self.__uv$config = {
    prefix: '/prox/vexxed-browser/',
    bare: 'https://bare2.onrender.com/',
    encodeUrl: Ultraviolet.codec.xor.encode,
    decodeUrl: Ultraviolet.codec.xor.decode,
    handler: '/prox/uv/uv.handler.js',
    bundle: '/prox/uv/uv.bundle.js',
    config: '/prox/uv/uv.config.js',
    sw: '/prox/uv/uv.sw.js',
};
