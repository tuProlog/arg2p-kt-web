"use strict";(self.webpackChunk_tuprolog_arg2p_playground=self.webpackChunk_tuprolog_arg2p_playground||[]).push([[366],{8366:(e,t,s)=>{s.d(t,{C:()=>u,a0:()=>p,dQ:()=>v,rm:()=>c,un:()=>r});var i=s(7110),n=s(8897),o=s(998),d=s(4442),a=s(9855),h=s(4950);function r(e,t){return void 0!==t?new m(new a.nA(e,void 0,t),t,void 0,void 0,void 0,n.nx):new m(new a.nA(void 0,void 0,e),e,void 0,void 0,void 0,n.nx)}function v(e,t,s){return new l(new a.nA(e,void 0,t),t,void 0,void 0,void 0,n.nx,s)}function u(e,t){return new m(new a.nA(e.owner,e.debugName,e.debugReferenceFn),t,void 0,void 0,e.onLastObserverRemoved,e.equalsFn??n.nx)}function c(e,t){let s,i;void 0===t?(s=e,i=void 0):(i=e,s=t);const d=new o.Cm;return new m(new a.nA(i,void 0,s),(e=>(d.clear(),s(e,d))),void 0,void 0,(()=>d.dispose()),n.nx)}function p(e,t){let s,i,d;return void 0===t?(s=e,i=void 0):(i=e,s=t),new m(new a.nA(i,void 0,s),(e=>{d?d.clear():d=new o.Cm;const t=s(e);return t&&d.add(t),t}),void 0,void 0,(()=>{d&&(d.dispose(),d=void 0)}),n.nx)}(0,d.N2)(u);class m extends d.ZK{get debugName(){return this._debugNameData.getDebugName(this)??"(anonymous)"}constructor(e,t,s,i,n=void 0,o){super(),this._debugNameData=e,this._computeFn=t,this.createChangeSummary=s,this._handleChange=i,this._handleLastObserverRemoved=n,this._equalityComparator=o,this.state=0,this.value=void 0,this.updateCount=0,this.dependencies=new Set,this.dependenciesToBeRemoved=new Set,this.changeSummary=void 0,this.changeSummary=this.createChangeSummary?.(),(0,h.tZ)()?.handleDerivedCreated(this)}onLastObserverRemoved(){this.state=0,this.value=void 0;for(const e of this.dependencies)e.removeObserver(this);this.dependencies.clear(),this._handleLastObserverRemoved?.()}get(){if(0===this.observers.size){const e=this._computeFn(this,this.createChangeSummary?.());return this.onLastObserverRemoved(),e}do{if(1===this.state)for(const e of this.dependencies)if(e.reportChanges(),2===this.state)break;1===this.state&&(this.state=3),this._recomputeIfNeeded()}while(3!==this.state);return this.value}_recomputeIfNeeded(){if(3===this.state)return;const e=this.dependenciesToBeRemoved;this.dependenciesToBeRemoved=this.dependencies,this.dependencies=e;const t=0!==this.state,s=this.value;this.state=3;const i=this.changeSummary;this.changeSummary=this.createChangeSummary?.();try{this.value=this._computeFn(this,i)}finally{for(const e of this.dependenciesToBeRemoved)e.removeObserver(this);this.dependenciesToBeRemoved.clear()}const n=t&&!this._equalityComparator(s,this.value);if((0,h.tZ)()?.handleDerivedRecomputed(this,{oldValue:s,newValue:this.value,change:void 0,didChange:n,hadValue:t}),n)for(const e of this.observers)e.handleChange(this,void 0)}toString(){return`LazyDerived<${this.debugName}>`}beginUpdate(e){this.updateCount++;const t=1===this.updateCount;if(3===this.state&&(this.state=1,!t))for(const e of this.observers)e.handlePossibleChange(this);if(t)for(const e of this.observers)e.beginUpdate(this)}endUpdate(e){if(this.updateCount--,0===this.updateCount){const e=[...this.observers];for(const t of e)t.endUpdate(this)}(0,i.Ft)((()=>this.updateCount>=0))}handlePossibleChange(e){if(3===this.state&&this.dependencies.has(e)&&!this.dependenciesToBeRemoved.has(e)){this.state=1;for(const e of this.observers)e.handlePossibleChange(this)}}handleChange(e,t){if(this.dependencies.has(e)&&!this.dependenciesToBeRemoved.has(e)){const s=!this._handleChange||this._handleChange({changedObservable:e,change:t,didChange:t=>t===e},this.changeSummary),i=3===this.state;if(s&&(1===this.state||i)&&(this.state=2,i))for(const e of this.observers)e.handlePossibleChange(this)}}readObservable(e){e.addObserver(this);const t=e.get();return this.dependencies.add(e),this.dependenciesToBeRemoved.delete(e),t}addObserver(e){const t=!this.observers.has(e)&&this.updateCount>0;super.addObserver(e),t&&e.beginUpdate(this)}removeObserver(e){const t=this.observers.has(e)&&this.updateCount>0;super.removeObserver(e),t&&e.endUpdate(this)}}class l extends m{constructor(e,t,s,i,n=void 0,o,d){super(e,t,s,i,n,o),this.set=d}}}}]);