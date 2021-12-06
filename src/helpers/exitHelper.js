const config = {
  // when CTRL-C event
  SIGINT: true,
  // when keyboard exit event
  SIGTERM: true,
  // when system kill event
  SIGQUIT: true,
};

/**
 * @param {callback} cb callback before shutdown this application
 */
module.exports = (cb) => {
  let handlers = [];

  Object.keys(config).forEach((key) => {
    const confVal = config[key];
    if (!confVal) return;

    let handler = () => {
      let args = Array.prototype.slice.call(arguments, 0);
      args.unshift(key);
      cb.apply(null, args);
    };

    process.on(key, handler);

    handlers.push([key, handler]);
  });

  return () => {
    handlers.forEach((args) => {
      let key = args[0];
      let handler = args[1];
      process.removeListener(key, handler);
    });
  };
};
