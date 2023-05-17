import TranslateBase from './base';
import { YoudaoOptions } from './constants';
// import { electron } from '../../src/util/electron';
import axios from 'axios';

export default class extends TranslateBase<YoudaoOptions> {
  name = 'Youdao';
  constructor(config: YoudaoOptions) {
    super(config);
  }

  async request(text: string, target: string, source = 'AUTO') {
    const transType =
      source && target
        ? `${source?.toUpperCase()}2${target?.toUpperCase()}`.replace(/-/, '_')
        : 'AUTO';
    const url = `http://fanyi.youdao.com/translate?&doctype=json&type=${transType}&i=${text}`;

    // const res: any = await electron.axiosRequest(url, {
    const res: any = await axios(url, {
      method: 'GET',
    });
    console.log(
      'youdao =>',
      transType,
      'res.translateResult ====================> ',
      res.translateResult
    );
    return res.translateResult?.[0]?.[0]?.tgt;
  }
}
