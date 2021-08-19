import { Vue, Component } from 'vue-property-decorator';

interface AssetDictionary {
  [pool: string]: {
    [assetName: string]: String;
  };
}

@Component
export default class AssetManager extends Vue {
  private assetDict: AssetDictionary = {
    page: {
      'about/founder': '5cc710a88f711754cd5b6acbab403b45e1aff44a',
      'about/platform': '834f73c31c2ab6ce41277e0b51d98dd4ac799a28',
      'about/tech': 'd1ee4fecef07eee9ae6f72e4b893a239f6678b68',
      'home/features/a': '11f1a01638f65f7060b0b6af0d735e3ba7ebd4d0',
      'home/features/b': '52fc8fe91f929bb490bd2e65398f79cd1dba62b8',
      'home/features/c': 'b635a653dd40465f70f5430f2613c5bf40c4ace3',
      'home/features/d': 'e57bd1705dcba46c7b9f4125c674d7f5554b2fc0',
      'home/features/e': 'c290b7f5cb33095840009fbee26cd5e96735c077',
      'home/features/f': '8c17ae5df4ed1bb59eb126a16a5f16510acca491',
      'home/features/g': '52938f8ad6eaee73c312d9e5536188297d1bf55c',
      'home/features/h': 'cc9e69487aeb3a239d2e396e38e2f7a22cab547a',
      'home/features/i': 'b72f8ec2e72fc87ca7b5529e02e790dbdafecbdc',
      'home/hero-side': '1e1c668e3750d53725e0cc3dcb2fe50d0ec6f92d',
      'profile/agreeableness/1': '21b8595c5ba6baefd2d82f970c555f23d1f47772',
      'profile/agreeableness/2': '2206fc01a0a3cc5d3dd7567315b176f253044292',
      'profile/agreeableness/3': '3489409149acc0649c517e14ee8a00cfe34ba1b8',
      'profile/agreeableness/4': '3b6d5be00384a6929d7179edaecd3c70c8b148e5',
      'profile/agreeableness/5': '6d832404ef60ce96d1bd677de10e5e7c44068cca',
      'profile/conscientiousness/1': '1c2ce10426473b8cea6191ef89fb6d7e64327831',
      'profile/conscientiousness/2': '13b5add06a1bc872da2a4afb94abc87e09841a26',
      'profile/conscientiousness/3': 'c877f76821342f7f8f5c891005e0282132264ce3',
      'profile/conscientiousness/4': '929cd8f8783754db6a4bcf93b5c6d07ead2f8fb5',
      'profile/conscientiousness/5': 'e5ecf319c0eb89e06138c2f35624ad37ee3fe3f4',
      'profile/extroversion/1': '22075defbde89745f16328e76ff89660a6da6f3d',
      'profile/extroversion/2': '48e791fbdc3c722e4c672406bb4b532dd2c1aa91',
      'profile/extroversion/3': 'd1ac094d075300bb43f55a551e4c5e36d9059db0',
      'profile/extroversion/4': '2f369f7a7d4e7390c2b58a4b8a9b825b5ad05808',
      'profile/extroversion/5': '14719db6986977e01b0b603a44a4a57a862f9c0d',
      'profile/neuroticism/1': 'aa083d5752635d3e3fd5cc455fb78180aeeb2d60',
      'profile/neuroticism/2': '6e595bbcbc557d2ae0b97b67ea269554d42ae1bd',
      'profile/neuroticism/3': '8aef8d0c73dd3e8260619215a7aab468f5ebb5a5',
      'profile/neuroticism/4': '377855b15e71dc0fe66d7450732ecbc7a53d280e',
      'profile/neuroticism/5': '9c7063cdab393d4a66a5ee9521ee44de84add1da',
      'profile/openness/1': '5886524d7cee4b06a7e2d933f49bdbe2ab500af2',
      'profile/openness/2': 'adc60a22d0fff332e90989fd2b454e511038e112',
      'profile/openness/3': '687f9dc21f40be20e2e061c64164214b2cb26522',
      'profile/openness/4': 'ece24e4a5565442903ae19f46a5d8ac34630019e',
      'profile/openness/5': 'c3c56f5b014e7af42450864acf224f48c9b8dc11',
      'register/testimonial/lara': '0c9baff0fa72d6647560caa6147c6a940ee7204d',
      'register/testimonial/saheedat-abdul': '2ae11730c1c9560b56af8b8692a6c9f11e83e060'
    },
    pt: {
      'color/black': '3a6e4b68f719c6e50f57b24650f465b49ad28cbb',
      'color/bright': 'a63db1d4f0b6bb9c79edf090e4ebae54e206f8fa',
      'color/cool': 'b99917ab94389ce1a5716c53b8fc6147a2332fb5',
      'color/neutral': 'bd379809ba6936cfcc1ad9946af54cbdafe909f1',
      'color/pale': '0a22d45ed1f0b0dd1817530c2c8b5f0e09e76e7e',
      'color/pastel': '8e04ad991e16ded34ed524f634a84d858dddf647',
      'color/sparkle': '55f643656e4fe6e8f8ffca669ff513eb3e96a4ac',
      'color/warm': '2a9fde55244912d2cd93de969d03ebf76d49036b',
      'main/hero': '59f5b252cb842ad1e511bdf77c1268f8f761c213',
      'print/animal': 'e29ff8539a004178b424a01553c3945f68fb2cca',
      'print/floral': 'f50323b4d6ace25cf24e062aaaa55c5b148b0c7e',
      'print/other': 'cc1e9e6e3a28b9d3c07b5f898898e4c30b8c35db',
      'print/solid': '887fbc9be054cdfc71625e9076829b508de3b6c9',
      'silhouette/bold': '36483e9774ebe17a2dae1b01f17f0c1d7a8c6d81',
      'silhouette/classic': '6e9f3662eb4aa8f39b0372633a1df12b2c6cc424',
      'silhouette/flirty': '60c27174c6b986b40359fc004b557822923a20bf',
      'silhouette/pencil': '3d398686efcfe33ff76a8722e713608cd4c30702',
      'silhouette/relaxed': 'a8c34640a513c72050732eafd78458f39d300646',
      'style-general/a': '99c9ae04aeae960e236eb7d88e3db8dc2923ac37',
      'style-general/b': '25b24cf724f96226f67cf57e3d24fd2b951ceeab',
      'style-general/c': '33d9d4e073438dd0142e1537c8c50ee2fae9915a',
      'style-general/d': '17b2ee457845659cac885bf8c94e60a5b5d1cc3c',
      'style-general/e': '1266f870766e27edc05046f8aa23495f6bc8b770',
      'style-general/f': 'b87be70375fbfa71c6be22040e1aa49128551ab8',
      'style-general/g': 'eb777e289438425197bfd5f6da27209ffe113cb3',
      'style-general/h': 'd2ae40e2295b53aa3d991f02487405c8d582b0e9',
      'style-general/i': 'b6ee6443b39b1504741816aa1f10a81d027e4d0e'
    },
    psykhed: {
      'anabel/circles': 'a2f5ac452d2f202867ba9300e42373b1624d3a89',
      'anabel/qanda/right': 'cd31e9d52549b8d30e31ab29d12933efbf756c48',
      'anabel/qanda/left': '438bbf0b04b91f7a96ecb692f0e8fbf854b5af13',
      'anabel/choice/o': '0bc8b94b326a921dccf9f14e18515fbec873c0f6',
      'anabel/choice/c': 'd7a07b7199852b9cb93102309fc66768ce563718',
      'anabel/choice/e': 'a8844d50733aa1e2eda55efe9dc3ea9fcba836c6',
      'anabel/choice/a': 'ae33760e2ed74ff82273628722492a54a9ebfe6e',
      'anabel/choice/n': '42534ea71a3aba98917018adfefc0ba7bda3c452',
      'ume/circles': '829751dcf5fe7ee612f1eebb848a40ee2d581a2d',
      'ume/qanda/right': '0ff2b54d13c52d014edb9f1a5479eee3b27f4f3f',
      'ume/qanda/left': '6af69f1f8c0e79a7f94e36af05c6c56cca0cc441',
      'ume/choice/o': '6c7a3051562ef090e83cf3368f3f0337a943b526',
      'ume/choice/c': '333afd74e3601b1404481fe6ce81d26cd4b243ca',
      'ume/choice/e': 'b0858152dfa1434f004d7ff62e3a502f5dbbd85d',
      'ume/choice/a': '925aa303b9f687de55e1a822ba40431c983e6a5d',
      'ume/choice/n': 'de6465bbb349e681ae97888812846d6aaa0953e4',
      'carmen/circles': '1728546ebf936f562c42d9066c60bc8488dbb397',
      'carmen/qanda/right': '78b3f24aa875dd30b67cff6e122f0a3cef27439b',
      'carmen/qanda/left': '1c41c0bb6ac9c366a7b868b57dd1fce6e283e32f',
      'carmen/choice/o': '6782b1387b8fbd8e7a8ab71bf62ae2f4b4235c70',
      'carmen/choice/c': '72688eb77bb8b40d09f1596157684ce9d6723307',
      'carmen/choice/e': 'c53edf5d2edb88ca770d43eb29e425142b1d1d46',
      'carmen/choice/a': '969d5dec5fcffb44f8b646239619466a334b48cf',
      'carmen/choice/n': '885f6fd4bba5de78b651b52e2cdb2b2870945ab1',
      'nav/anabel': 'a10963f409aaf5e18a597a6610c6b74ece36a2ee',
      'nav/carmen': 'f7a1f04ad75408f5a2d6732d695f79471f5784e7',
      'nav/tpof': 'ae4e4fa4bd22b03f8e1b878275eab8e912797545',
      'nav/ume': 'f6ed35dff2b2e1afce3120e916b91792035f2ecf'
    }
  };

  public getUrl(pool: string, asset: string, ts: number = 0): string {
    const tsQs = ts ? '?ts=' + ts : '';
    if (pool === 'user') {
      return `${process.env.AVATAR_CDN_URL}/:width:x:height:/${pool}/${asset.substring(0, 2)}/${asset.substring(
        2,
        4
      )}/${asset}.jpg.webp${tsQs}`;
    }

    if (pool in this.assetDict && asset in this.assetDict[pool]) {
      const assetHash = this.assetDict[pool][asset];
      return `${process.env.MEDIA_CDN_URL}/:width:x:height:/${pool}/${assetHash.substring(0, 2)}/${assetHash.substring(
        2,
        4
      )}/${assetHash}.jpg.webp${tsQs}`;
    }

    return '';
  }
}
