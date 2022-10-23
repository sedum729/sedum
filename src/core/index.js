import { defaultWebComponent } from './shadow';

import ZhiYuan from './sandbox';

import { importHTML } from './entry';

import { win_sandbox_name, win_child_runtime } from './constant';

if (window[win_sandbox_name] && !window[win_child_runtime]) {
  throw 'break';
}

// 定义自定义组件
defaultWebComponent();

export async function start(options) {
  const { url, name } = options;

  const sandbox = new ZhiYuan(options);

  const { template } = await importHTML(url);

  await sandbox.active({
    template
  });

  await sandbox.start({

  });

  return sandbox.destroy;
}