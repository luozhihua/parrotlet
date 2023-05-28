<template>
  <div class="country-flag" :class="cssClasses" :style="styles">
    <q-img :src="flag" lazy :ratio="rounded ? 1 : 4/3" :spinnerSize="spinnerSize">
      <slot></slot>
      <template #error>
        <span class="q-img-fallback"></span>
      </template>
    </q-img>
  </div>
</template>

<script lang="ts" setup>
import {computed, reactive} from 'vue'

import ad from '../../public/flags/ad.svg';
import ae from '../../public/flags/ae.svg';
import af from '../../public/flags/af.svg';
import ag from '../../public/flags/ag.svg';
import ai from '../../public/flags/ai.svg';
import al from '../../public/flags/al.svg';
import am from '../../public/flags/am.svg';
import an from '../../public/flags/an.svg';
import ao from '../../public/flags/ao.svg';
import aq from '../../public/flags/aq.svg';
import ar from '../../public/flags/ar.svg';
import as from '../../public/flags/as.svg';
import at from '../../public/flags/at.svg';
import au from '../../public/flags/au.svg';
import aw from '../../public/flags/aw.svg';
import ax from '../../public/flags/ax.svg';
import az from '../../public/flags/az.svg';
import ba from '../../public/flags/ba.svg';
import bb from '../../public/flags/bb.svg';
import bd from '../../public/flags/bd.svg';
import be from '../../public/flags/be.svg';
import bf from '../../public/flags/bf.svg';
import bg from '../../public/flags/bg.svg';
import bh from '../../public/flags/bh.svg';
import bi from '../../public/flags/bi.svg';
import bj from '../../public/flags/bj.svg';
import bl from '../../public/flags/bl.svg';
import bm from '../../public/flags/bm.svg';
import bn from '../../public/flags/bn.svg';
import bo from '../../public/flags/bo.svg';
import bq from '../../public/flags/bq.svg';
import br from '../../public/flags/br.svg';
import bs from '../../public/flags/bs.svg';
import bt from '../../public/flags/bt.svg';
import bv from '../../public/flags/bv.svg';
import bw from '../../public/flags/bw.svg';
import by from '../../public/flags/by.svg';
import bz from '../../public/flags/bz.svg';
import ca from '../../public/flags/ca.svg';
import cc from '../../public/flags/cc.svg';
import cd from '../../public/flags/cd.svg';
import cf from '../../public/flags/cf.svg';
import cg from '../../public/flags/cg.svg';
import ch from '../../public/flags/ch.svg';
import ci from '../../public/flags/ci.svg';
import ck from '../../public/flags/ck.svg';
import cl from '../../public/flags/cl.svg';
import cm from '../../public/flags/cm.svg';
import cn from '../../public/flags/cn.svg';
import co from '../../public/flags/co.svg';
import cr from '../../public/flags/cr.svg';
import cu from '../../public/flags/cu.svg';
import cv from '../../public/flags/cv.svg';
import cw from '../../public/flags/cw.svg';
import cx from '../../public/flags/cx.svg';
import cy from '../../public/flags/cy.svg';
import cz from '../../public/flags/cz.svg';
import de from '../../public/flags/de.svg';
import dj from '../../public/flags/dj.svg';
import dk from '../../public/flags/dk.svg';
import dm from '../../public/flags/dm.svg';
import doSvg from '../../public/flags/do.svg';
import dz from '../../public/flags/dz.svg';
import ec from '../../public/flags/ec.svg';
import ee from '../../public/flags/ee.svg';
import eg from '../../public/flags/eg.svg';
import eh from '../../public/flags/eh.svg';
import er from '../../public/flags/er.svg';
import es from '../../public/flags/es.svg';
import et from '../../public/flags/et.svg';
import eu from '../../public/flags/eu.svg';
import fi from '../../public/flags/fi.svg';
import fj from '../../public/flags/fj.svg';
import fk from '../../public/flags/fk.svg';
import fm from '../../public/flags/fm.svg';
import fo from '../../public/flags/fo.svg';
import fr from '../../public/flags/fr.svg';
import ga from '../../public/flags/ga.svg';
import gb_eng from '../../public/flags/gb-eng.svg';
import gb_nir from '../../public/flags/gb-nir.svg';
import gb_sct from '../../public/flags/gb-sct.svg';
import gb_wls from '../../public/flags/gb-wls.svg';
import gb from '../../public/flags/gb.svg';
import gd from '../../public/flags/gd.svg';
import ge from '../../public/flags/ge.svg';
import gf from '../../public/flags/gf.svg';
import gg from '../../public/flags/gg.svg';
import gh from '../../public/flags/gh.svg';
import gi from '../../public/flags/gi.svg';
import gl from '../../public/flags/gl.svg';
import gm from '../../public/flags/gm.svg';
import gn from '../../public/flags/gn.svg';
import gp from '../../public/flags/gp.svg';
import gq from '../../public/flags/gq.svg';
import gr from '../../public/flags/gr.svg';
import gs from '../../public/flags/gs.svg';
import gt from '../../public/flags/gt.svg';
import gu from '../../public/flags/gu.svg';
import gw from '../../public/flags/gw.svg';
import gy from '../../public/flags/gy.svg';
import hk from '../../public/flags/hk.svg';
import hm from '../../public/flags/hm.svg';
import hn from '../../public/flags/hn.svg';
import hr from '../../public/flags/hr.svg';
import ht from '../../public/flags/ht.svg';
import hu from '../../public/flags/hu.svg';
import id from '../../public/flags/id.svg';
import ie from '../../public/flags/ie.svg';
import il from '../../public/flags/il.svg';
import im from '../../public/flags/im.svg';
import inSvg from '../../public/flags/in.svg';
import io from '../../public/flags/io.svg';
import iq from '../../public/flags/iq.svg';
import ir from '../../public/flags/ir.svg';
import is from '../../public/flags/is.svg';
import it from '../../public/flags/it.svg';
import je from '../../public/flags/je.svg';
import jm from '../../public/flags/jm.svg';
import jo from '../../public/flags/jo.svg';
import jp from '../../public/flags/jp.svg';
import ke from '../../public/flags/ke.svg';
import kg from '../../public/flags/kg.svg';
import kh from '../../public/flags/kh.svg';
import ki from '../../public/flags/ki.svg';
import km from '../../public/flags/km.svg';
import kn from '../../public/flags/kn.svg';
import kp from '../../public/flags/kp.svg';
import kr from '../../public/flags/kr.svg';
import kw from '../../public/flags/kw.svg';
import ky from '../../public/flags/ky.svg';
import kz from '../../public/flags/kz.svg';
import la from '../../public/flags/la.svg';
import lb from '../../public/flags/lb.svg';
import lc from '../../public/flags/lc.svg';
import li from '../../public/flags/li.svg';
import lk from '../../public/flags/lk.svg';
import lr from '../../public/flags/lr.svg';
import ls from '../../public/flags/ls.svg';
import lt from '../../public/flags/lt.svg';
import lu from '../../public/flags/lu.svg';
import lv from '../../public/flags/lv.svg';
import ly from '../../public/flags/ly.svg';
import ma from '../../public/flags/ma.svg';
import mc from '../../public/flags/mc.svg';
import md from '../../public/flags/md.svg';
import me from '../../public/flags/me.svg';
import mf from '../../public/flags/mf.svg';
import mg from '../../public/flags/mg.svg';
import mh from '../../public/flags/mh.svg';
import mk from '../../public/flags/mk.svg';
import ml from '../../public/flags/ml.svg';
import mm from '../../public/flags/mm.svg';
import mn from '../../public/flags/mn.svg';
import mo from '../../public/flags/mo.svg';
import mp from '../../public/flags/mp.svg';
import mq from '../../public/flags/mq.svg';
import mr from '../../public/flags/mr.svg';
import ms from '../../public/flags/ms.svg';
import mt from '../../public/flags/mt.svg';
import mu from '../../public/flags/mu.svg';
import mv from '../../public/flags/mv.svg';
import mw from '../../public/flags/mw.svg';
import mx from '../../public/flags/mx.svg';
import my from '../../public/flags/my.svg';
import mz from '../../public/flags/mz.svg';
import na from '../../public/flags/na.svg';
import nc from '../../public/flags/nc.svg';
import ne from '../../public/flags/ne.svg';
import nf from '../../public/flags/nf.svg';
import ng from '../../public/flags/ng.svg';
import ni from '../../public/flags/ni.svg';
import nl from '../../public/flags/nl.svg';
import no from '../../public/flags/no.svg';
import np from '../../public/flags/np.svg';
import nr from '../../public/flags/nr.svg';
import nu from '../../public/flags/nu.svg';
import nz from '../../public/flags/nz.svg';
import om from '../../public/flags/om.svg';
import pa from '../../public/flags/pa.svg';
import pe from '../../public/flags/pe.svg';
import pf from '../../public/flags/pf.svg';
import pg from '../../public/flags/pg.svg';
import ph from '../../public/flags/ph.svg';
import pk from '../../public/flags/pk.svg';
import pl from '../../public/flags/pl.svg';
import placeholder from '../../public/flags/placeholder.svg';
import pm from '../../public/flags/pm.svg';
import pn from '../../public/flags/pn.svg';
import pr from '../../public/flags/pr.svg';
import ps from '../../public/flags/ps.svg';
import pt from '../../public/flags/pt.svg';
import pw from '../../public/flags/pw.svg';
import py from '../../public/flags/py.svg';
import qa from '../../public/flags/qa.svg';
import re from '../../public/flags/re.svg';
import ro from '../../public/flags/ro.svg';
import rs from '../../public/flags/rs.svg';
import ru from '../../public/flags/ru.svg';
import rw from '../../public/flags/rw.svg';
import sa from '../../public/flags/sa.svg';
import sb from '../../public/flags/sb.svg';
import sc from '../../public/flags/sc.svg';
import sd from '../../public/flags/sd.svg';
import se from '../../public/flags/se.svg';
import sg from '../../public/flags/sg.svg';
import sh from '../../public/flags/sh.svg';
import si from '../../public/flags/si.svg';
import sj from '../../public/flags/sj.svg';
import sk from '../../public/flags/sk.svg';
import sl from '../../public/flags/sl.svg';
import sm from '../../public/flags/sm.svg';
import sn from '../../public/flags/sn.svg';
import so from '../../public/flags/so.svg';
import sr from '../../public/flags/sr.svg';
import ss from '../../public/flags/ss.svg';
import st from '../../public/flags/st.svg';
import sv from '../../public/flags/sv.svg';
import sx from '../../public/flags/sx.svg';
import sy from '../../public/flags/sy.svg';
import sz from '../../public/flags/sz.svg';
import tc from '../../public/flags/tc.svg';
import td from '../../public/flags/td.svg';
import tf from '../../public/flags/tf.svg';
import tg from '../../public/flags/tg.svg';
import th from '../../public/flags/th.svg';
import tj from '../../public/flags/tj.svg';
import tk from '../../public/flags/tk.svg';
import tl from '../../public/flags/tl.svg';
import tm from '../../public/flags/tm.svg';
import tn from '../../public/flags/tn.svg';
import to from '../../public/flags/to.svg';
import tr from '../../public/flags/tr.svg';
import tt from '../../public/flags/tt.svg';
import tv from '../../public/flags/tv.svg';
import tw from '../../public/flags/tw.svg';
import tz from '../../public/flags/tz.svg';
import ua from '../../public/flags/ua.svg';
import ug from '../../public/flags/ug.svg';
import um from '../../public/flags/um.svg';
import us from '../../public/flags/us.svg';
import uy from '../../public/flags/uy.svg';
import uz from '../../public/flags/uz.svg';
import va from '../../public/flags/va.svg';
import vc from '../../public/flags/vc.svg';
import ve from '../../public/flags/ve.svg';
import vg from '../../public/flags/vg.svg';
import vi from '../../public/flags/vi.svg';
import vn from '../../public/flags/vn.svg';
import vu from '../../public/flags/vu.svg';
import wf from '../../public/flags/wf.svg';
import ws from '../../public/flags/ws.svg';
import xk from '../../public/flags/xk.svg';
import ye from '../../public/flags/ye.svg';
import yt from '../../public/flags/yt.svg';
import za from '../../public/flags/za.svg';
import zm from '../../public/flags/zm.svg';
import zw from '../../public/flags/zw.svg';


// eslint-disable-next-line no-undef
const props = defineProps({
  rounded: { type: Boolean, default: true, },
  shadowed: { type: Boolean, default: true, },
  bordered: { type: Boolean, default: true, },
  square: { type: Boolean, default: false, },
  code: { type: String, required: true, },
})
const flags: {[k:string]: any} = {
ad,
ae,
af,
ag,
ai,
al,
am,
an,
ao,
aq,
ar,
as,
at,
au,
aw,
ax,
az,
ba,
bb,
bd,
be,
bf,
bg,
bh,
bi,
bj,
bl,
bm,
bn,
bo,
bq,
br,
bs,
bt,
bv,
bw,
by,
bz,
ca,
cc,
cd,
cf,
cg,
ch,
ci,
ck,
cl,
cm,
cn,
co,
cr,
cu,
cv,
cw,
cx,
cy,
cz,
de,
dj,
dk,
dm,
doSvg,
dz,
ec,
ee,
eg,
eh,
er,
es,
et,
eu,
fi,
fj,
fk,
fm,
fo,
fr,
ga,
gb_eng,
gb_nir,
gb_sct,
gb_wls,
gb,
gd,
ge,
gf,
gg,
gh,
gi,
gl,
gm,
gn,
gp,
gq,
gr,
gs,
gt,
gu,
gw,
gy,
hk,
hm,
hn,
hr,
ht,
hu,
id,
ie,
il,
im,
inSvg,
io,
iq,
ir,
is,
it,
je,
jm,
jo,
jp,
ke,
kg,
kh,
ki,
km,
kn,
kp,
kr,
kw,
ky,
kz,
la,
lb,
lc,
li,
lk,
lr,
ls,
lt,
lu,
lv,
ly,
ma,
mc,
md,
me,
mf,
mg,
mh,
mk,
ml,
mm,
mn,
mo,
mp,
mq,
mr,
ms,
mt,
mu,
mv,
mw,
mx,
my,
mz,
na,
nc,
ne,
nf,
ng,
ni,
nl,
no,
np,
nr,
nu,
nz,
om,
pa,
pe,
pf,
pg,
ph,
pk,
pl,
placeholder,
pm,
pn,
pr,
ps,
pt,
pw,
py,
qa,
re,
ro,
rs,
ru,
rw,
sa,
sb,
sc,
sd,
se,
sg,
sh,
si,
sj,
sk,
sl,
sm,
sn,
so,
sr,
ss,
st,
sv,
sx,
sy,
sz,
tc,
td,
tf,
tg,
th,
tj,
tk,
tl,
tm,
tn,
to,
tr,
tt,
tv,
tw,
tz,
ua,
ug,
um,
us,
uy,
uz,
va,
vc,
ve,
vg,
vi,
vn,
vu,
wf,
ws,
xk,
ye,
yt,
za,
zm,
zw,
}
const langToContryMapping = reactive({
  en: 'gb',
  zh: 'cn',
  tw: 'cn',
  ja: 'jp',
  ko: 'kr', // 韩语
  sq:'al', //
  uk: 'ua', // 乌克兰
  syr: 'sy', // 叙利亚
  kk: 'kz', // 哈萨克斯坦
  el: 'gr', // 希腊
  da: 'dk', // 丹麦
  div: 'mv', // 马尔代夫
  cs: 'cz', // 捷克
  hy: 'am', // 亚美尼亚
  ka: 'ge', // 格鲁吉亚
  fa: 'ir', // 伊朗-波斯语
  he: 'il', // 以色列-希伯来语
  kor: 'kp', // 朝鲜
  in: 'inSvg',
  do: 'doSvg',
  'gb-eng': gb_eng,
  'gb-nir': gb_nir,
  'gb-sct': gb_sct,
  'gb-wls': gb_wls,
})

const flag = computed((): string => {
  const code: string = props.code;
  const contryCode = (code.split(/[_-]/).pop() || '').toLowerCase();
  type K = keyof typeof langToContryMapping
  const langCode = langToContryMapping[contryCode as K]
    || langToContryMapping[code.toLowerCase() as K]
    || contryCode.toLowerCase() || '';
  const img = flags[langCode];
  console.log(code, contryCode, langCode);
  return img;
})

const cssClasses = computed(() => {
  return {
    shadowed: props.shadowed,
    bordered: props.bordered,
    rounded: !props.square && props.rounded,
    square: props.square,
  }
})

const styles = computed(() => {
  return {
    width: '1.33em',
    height: '1em',
  }
})

const spinnerSize = computed(()=>{
  return '0.8em'
})
</script>

<style lang="scss">
.country-flag {
  overflow: hidden;
  display: inline-block;
  border-radius: 10%;

  &.bordered {
    border: 1px solid rgba(123, 123, 123, 0.3);
  }

  &.shadowed {
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.2), 2px 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:square {
    border-radius: 0px;
  }

  &.rounded {
    border-radius: 100000px;
  }

  .q-img {
    position: relative;
    height: 100%;
    vertical-align: top;
  }

  .q-img-fallback {
    width: 100%;
    height: 100%;
    background-image: url('../../public/flags/placeholder.svg');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 2
  }
}
</style>
