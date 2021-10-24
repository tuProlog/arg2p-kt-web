(function (root, factory) {
  if (typeof define === 'function' && define.amd)
    define(['exports', 'kotlin', '@tuprolog/2p-solve', '@tuprolog/2p-dsl-theory', '@tuprolog/2p-dsl-core', '@tuprolog/2p-unify', '@tuprolog/2p-core', '@tuprolog/2p-theory', '@tuprolog/2p-parser-theory', '@tuprolog/2p-solve-classic', '@tuprolog/2p-parser-core'], factory);
  else if (typeof exports === 'object')
    factory(module.exports, require('kotlin'), require('@tuprolog/2p-solve'), require('@tuprolog/2p-dsl-theory'), require('@tuprolog/2p-dsl-core'), require('@tuprolog/2p-unify'), require('@tuprolog/2p-core'), require('@tuprolog/2p-theory'), require('@tuprolog/2p-parser-theory'), require('@tuprolog/2p-solve-classic'), require('@tuprolog/2p-parser-core'));
  else {
    if (typeof kotlin === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency 'kotlin' was not found. Please, check whether 'kotlin' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-solve'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-solve' was not found. Please, check whether '@tuprolog/2p-solve' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-dsl-theory'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-dsl-theory' was not found. Please, check whether '@tuprolog/2p-dsl-theory' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-dsl-core'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-dsl-core' was not found. Please, check whether '@tuprolog/2p-dsl-core' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-unify'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-unify' was not found. Please, check whether '@tuprolog/2p-unify' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-core'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-core' was not found. Please, check whether '@tuprolog/2p-core' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-theory'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-theory' was not found. Please, check whether '@tuprolog/2p-theory' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-parser-theory'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-parser-theory' was not found. Please, check whether '@tuprolog/2p-parser-theory' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-solve-classic'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-solve-classic' was not found. Please, check whether '@tuprolog/2p-solve-classic' is loaded prior to '@tuprolog/arg2p-core'.");
    }if (typeof this['@tuprolog/2p-parser-core'] === 'undefined') {
      throw new Error("Error loading module '@tuprolog/arg2p-core'. Its dependency '@tuprolog/2p-parser-core' was not found. Please, check whether '@tuprolog/2p-parser-core' is loaded prior to '@tuprolog/arg2p-core'.");
    }root['@tuprolog/arg2p-core'] = factory(typeof this['@tuprolog/arg2p-core'] === 'undefined' ? {} : this['@tuprolog/arg2p-core'], kotlin, this['@tuprolog/2p-solve'], this['@tuprolog/2p-dsl-theory'], this['@tuprolog/2p-dsl-core'], this['@tuprolog/2p-unify'], this['@tuprolog/2p-core'], this['@tuprolog/2p-theory'], this['@tuprolog/2p-parser-theory'], this['@tuprolog/2p-solve-classic'], this['@tuprolog/2p-parser-core']);
  }
}(this, function (_, Kotlin, $module$_2p_solve, $module$_2p_dsl_theory, $module$_2p_dsl_core, $module$_2p_unify, $module$_2p_core, $module$_2p_theory, $module$_2p_parser_theory, $module$_2p_solve_classic, $module$_2p_parser_core) {
  'use strict';
  var Libraries = $module$_2p_solve.it.unibo.tuprolog.solve.library.Libraries;
  var listOf = Kotlin.kotlin.collections.listOf_mh5how$;
  var plus = Kotlin.kotlin.collections.plus_mydzjv$;
  var Kind_CLASS = Kotlin.Kind.CLASS;
  var Kind_OBJECT = Kotlin.Kind.OBJECT;
  var Kind_INTERFACE = Kotlin.Kind.INTERFACE;
  var listOf_0 = Kotlin.kotlin.collections.listOf_i5x0yv$;
  var collectionSizeOrDefault = Kotlin.kotlin.collections.collectionSizeOrDefault_ba2ldo$;
  var ArrayList_init = Kotlin.kotlin.collections.ArrayList_init_ww73n8$;
  var UnsupportedOperationException_init = Kotlin.kotlin.UnsupportedOperationException_init_pdl1vj$;
  var PrologScopeWithTheories = $module$_2p_dsl_theory.it.unibo.tuprolog.dsl.theory.PrologScopeWithTheories;
  var PrologScope = $module$_2p_dsl_core.it.unibo.tuprolog.dsl.PrologScope;
  var Unificator = $module$_2p_unify.it.unibo.tuprolog.unify.Unificator;
  var OperatorSet = $module$_2p_core.it.unibo.tuprolog.core.operators.OperatorSet;
  var union = Kotlin.kotlin.collections.union_q4559j$;
  var Library = $module$_2p_solve.it.unibo.tuprolog.solve.library.Library;
  var Theory = $module$_2p_theory.it.unibo.tuprolog.theory.Theory;
  var parse = $module$_2p_parser_theory.it.unibo.tuprolog.theory.parsing.parseTheoryWithOperators;
  var lazy = Kotlin.kotlin.lazy_klfg04$;
  var Primitive = $module$_2p_solve.it.unibo.tuprolog.solve.primitive.Primitive;
  var sequenceOf = Kotlin.kotlin.sequences.sequenceOf_i5x0yv$;
  var Signature = $module$_2p_solve.it.unibo.tuprolog.solve.Signature;
  var map = Kotlin.kotlin.sequences.map_z5avom$;
  var COROUTINE_SUSPENDED = Kotlin.kotlin.coroutines.intrinsics.COROUTINE_SUSPENDED;
  var CoroutineImpl = Kotlin.kotlin.coroutines.CoroutineImpl;
  var sequence = Kotlin.kotlin.sequences.sequence_o0x0bg$;
  var emptyList = Kotlin.kotlin.collections.emptyList_287e2$;
  var MutableSolver = $module$_2p_solve.it.unibo.tuprolog.solve.MutableSolver;
  var MutableTheory = $module$_2p_theory.it.unibo.tuprolog.theory.MutableTheory;
  var classic = $module$_2p_solve_classic.it.unibo.tuprolog.solve.classic.classicMutableSolver;
  var flags = $module$_2p_solve.it.unibo.tuprolog.solve.flags;
  var mapCapacity = Kotlin.kotlin.collections.mapCapacity_za3lpa$;
  var coerceAtLeast = Kotlin.kotlin.ranges.coerceAtLeast_dqglrj$;
  var LinkedHashMap_init = Kotlin.kotlin.collections.LinkedHashMap_init_bwtc7$;
  var Substitution = $module$_2p_core.it.unibo.tuprolog.core.Substitution;
  var Numeric = $module$_2p_core.it.unibo.tuprolog.core.Numeric;
  var ensureNotNull = Kotlin.ensureNotNull;
  var to = Kotlin.kotlin.to_ujzrz7$;
  var mutableMapOf = Kotlin.kotlin.collections.mutableMapOf_qfcya0$;
  var Atom = $module$_2p_core.it.unibo.tuprolog.core.Atom;
  var TypeError = $module$_2p_solve.it.unibo.tuprolog.solve.exception.error.TypeError;
  var TypeError$Expected = $module$_2p_solve.it.unibo.tuprolog.solve.exception.error.TypeError.Expected;
  var Struct = $module$_2p_core.it.unibo.tuprolog.core.Struct;
  var throwCCE = Kotlin.throwCCE;
  var equals = Kotlin.equals;
  var DomainError = $module$_2p_solve.it.unibo.tuprolog.solve.exception.error.DomainError;
  var DomainError$Expected = $module$_2p_solve.it.unibo.tuprolog.solve.exception.error.DomainError.Expected;
  var Unit = Kotlin.kotlin.Unit;
  var filter = Kotlin.kotlin.sequences.filter_euau3h$;
  var first = Kotlin.kotlin.sequences.first_veqyi0$;
  var prolog = $module$_2p_dsl_core.it.unibo.tuprolog.dsl.prolog;
  var Specifier = $module$_2p_core.it.unibo.tuprolog.core.operators.Specifier;
  var Operator = $module$_2p_core.it.unibo.tuprolog.core.operators.Operator;
  var OperatorSet_init = $module$_2p_core.it.unibo.tuprolog.core.operators.OperatorSet_init_1gzv2l$;
  var ArrayList_init_0 = Kotlin.kotlin.collections.ArrayList_init_287e2$;
  var Clause = $module$_2p_core.it.unibo.tuprolog.core.Clause;
  var parse_0 = $module$_2p_parser_core.it.unibo.tuprolog.core.parsing.parseClause;
  var parse_1 = $module$_2p_parser_core.it.unibo.tuprolog.core.parsing.parseStruct;
  var trimIndent = Kotlin.kotlin.text.trimIndent_pdl1vz$;
  var parse_2 = $module$_2p_parser_theory.it.unibo.tuprolog.theory.parsing.parseTheory;
  var mapOf = Kotlin.kotlin.collections.mapOf_x2b85n$;
  var List = $module$_2p_core.it.unibo.tuprolog.core.List;
  var Solution$Yes = $module$_2p_solve.it.unibo.tuprolog.solve.Solution.Yes;
  var Solver = $module$_2p_solve.it.unibo.tuprolog.solve.Solver;
  var classic_0 = $module$_2p_solve_classic.it.unibo.tuprolog.solve.classic.classicSolver;
  var toString = Kotlin.toString;
  var prolog_0 = $module$_2p_dsl_theory.it.unibo.tuprolog.dsl.theory.prolog;
  var contains = Kotlin.kotlin.text.contains_li3zpu$;
  var removeSurrounding = Kotlin.kotlin.text.removeSurrounding_gsj5wt$;
  var toList = Kotlin.kotlin.sequences.toList_veqyi0$;
  var getPropertyCallableRef = Kotlin.getPropertyCallableRef;
  var mapOf_0 = Kotlin.kotlin.collections.mapOf_qfcya0$;
  var Var = $module$_2p_core.it.unibo.tuprolog.core.Var;
  var first_0 = Kotlin.kotlin.collections.first_2p1efm$;
  var PrimitiveWrapper = $module$_2p_solve.it.unibo.tuprolog.solve.primitive.PrimitiveWrapper;
  var Random = Kotlin.kotlin.random.Random;
  var toTerm = $module$_2p_core.it.unibo.tuprolog.core.listToTerm;
  var UnaryPredicate$WithoutSideEffects = $module$_2p_solve.it.unibo.tuprolog.solve.primitive.UnaryPredicate.WithoutSideEffects;
  var copyToArray = Kotlin.kotlin.collections.copyToArray;
  var compareBy = Kotlin.kotlin.comparisons.compareBy_bvgy4j$;
  var sortedWith = Kotlin.kotlin.sequences.sortedWith_vjgqpk$;
  var mapIndexed = Kotlin.kotlin.sequences.mapIndexed_b7yuyq$;
  var firstOrNull = Kotlin.kotlin.sequences.firstOrNull_veqyi0$;
  var NoSuchElementException_init = Kotlin.kotlin.NoSuchElementException;
  var addAll = Kotlin.kotlin.collections.addAll_ipc267$;
  var firstOrNull_0 = Kotlin.kotlin.collections.firstOrNull_2p1efm$;
  var plus_0 = Kotlin.kotlin.collections.plus_qloxvw$;
  var Cons = $module$_2p_core.it.unibo.tuprolog.core.Cons;
  LazyRawPrologContent.prototype = Object.create(BaseArgLibrary.prototype);
  LazyRawPrologContent.prototype.constructor = LazyRawPrologContent;
  Cache.prototype = Object.create(BaseArgLibrary.prototype);
  Cache.prototype.constructor = Cache;
  Context.prototype = Object.create(BaseArgLibrary.prototype);
  Context.prototype.constructor = Context;
  DynamicLoader$WithLib.prototype = Object.create(DynamicLoader$AbstractWithLib.prototype);
  DynamicLoader$WithLib.prototype.constructor = DynamicLoader$WithLib;
  DynamicLoader$WithLibInNewContext.prototype = Object.create(DynamicLoader$AbstractWithLib.prototype);
  DynamicLoader$WithLibInNewContext.prototype.constructor = DynamicLoader$WithLibInNewContext;
  DynamicLoader.prototype = Object.create(BaseArgLibrary.prototype);
  DynamicLoader.prototype.constructor = DynamicLoader;
  EngineInterfaceBase.prototype = Object.create(LazyRawPrologContent.prototype);
  EngineInterfaceBase.prototype.constructor = EngineInterfaceBase;
  FlagsBuilder$create$ObjectLiteral.prototype = Object.create(BaseArgLibrary.prototype);
  FlagsBuilder$create$ObjectLiteral.prototype.constructor = FlagsBuilder$create$ObjectLiteral;
  MetaInterpreter.prototype = Object.create(BaseArgLibrary.prototype);
  MetaInterpreter.prototype.constructor = MetaInterpreter;
  ModuleCalls.prototype = Object.create(BaseArgLibrary.prototype);
  ModuleCalls.prototype.constructor = ModuleCalls;
  AbstractModeBase.prototype = Object.create(LazyRawPrologContent.prototype);
  AbstractModeBase.prototype.constructor = AbstractModeBase;
  ArgumentationGraphBuilderBase.prototype = Object.create(LazyRawPrologContent.prototype);
  ArgumentationGraphBuilderBase.prototype.constructor = ArgumentationGraphBuilderBase;
  AttackRestrictionHandlerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  AttackRestrictionHandlerBase.prototype.constructor = AttackRestrictionHandlerBase;
  BpMetaGraphHandlerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  BpMetaGraphHandlerBase.prototype.constructor = BpMetaGraphHandlerBase;
  DefeasiblePreferencesHandlerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  DefeasiblePreferencesHandlerBase.prototype.constructor = DefeasiblePreferencesHandlerBase;
  GenericDefeasiblePreferencesHandlerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  GenericDefeasiblePreferencesHandlerBase.prototype.constructor = GenericDefeasiblePreferencesHandlerBase;
  StrictPreferencesHandlerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  StrictPreferencesHandlerBase.prototype.constructor = StrictPreferencesHandlerBase;
  BpCompleteLabellerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  BpCompleteLabellerBase.prototype.constructor = BpCompleteLabellerBase;
  BpLabellerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  BpLabellerBase.prototype.constructor = BpLabellerBase;
  BpPartialLabellerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  BpPartialLabellerBase.prototype.constructor = BpPartialLabellerBase;
  CompleteLabellerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  CompleteLabellerBase.prototype.constructor = CompleteLabellerBase;
  GroundedLabellerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  GroundedLabellerBase.prototype.constructor = GroundedLabellerBase;
  StatementLabellerBase.prototype = Object.create(LazyRawPrologContent.prototype);
  StatementLabellerBase.prototype.constructor = StatementLabellerBase;
  RuleParserBase.prototype = Object.create(LazyRawPrologContent.prototype);
  RuleParserBase.prototype.constructor = RuleParserBase;
  StrictRules.prototype = Object.create(UnaryPredicate$WithoutSideEffects.prototype);
  StrictRules.prototype.constructor = StrictRules;
  Axioms.prototype = Object.create(UnaryPredicate$WithoutSideEffects.prototype);
  Axioms.prototype.constructor = Axioms;
  Premises.prototype = Object.create(UnaryPredicate$WithoutSideEffects.prototype);
  Premises.prototype.constructor = Premises;
  DefeasibleRules.prototype = Object.create(UnaryPredicate$WithoutSideEffects.prototype);
  DefeasibleRules.prototype.constructor = DefeasibleRules;
  Bps.prototype = Object.create(UnaryPredicate$WithoutSideEffects.prototype);
  Bps.prototype.constructor = Bps;
  StructuredModeBase.prototype = Object.create(LazyRawPrologContent.prototype);
  StructuredModeBase.prototype.constructor = StructuredModeBase;
  DebugBase.prototype = Object.create(LazyRawPrologContent.prototype);
  DebugBase.prototype.constructor = DebugBase;
  SuperiorityRelationBase.prototype = Object.create(LazyRawPrologContent.prototype);
  SuperiorityRelationBase.prototype.constructor = SuperiorityRelationBase;
  UtilsBase.prototype = Object.create(LazyRawPrologContent.prototype);
  UtilsBase.prototype.constructor = UtilsBase;
  EngineInterface.prototype = Object.create(EngineInterfaceBase.prototype);
  EngineInterface.prototype.constructor = EngineInterface;
  AbstractMode.prototype = Object.create(AbstractModeBase.prototype);
  AbstractMode.prototype.constructor = AbstractMode;
  ArgumentationGraphBuilder.prototype = Object.create(ArgumentationGraphBuilderBase.prototype);
  ArgumentationGraphBuilder.prototype.constructor = ArgumentationGraphBuilder;
  AttackRestrictionHandler.prototype = Object.create(AttackRestrictionHandlerBase.prototype);
  AttackRestrictionHandler.prototype.constructor = AttackRestrictionHandler;
  BpMetaGraphHandler.prototype = Object.create(BpMetaGraphHandlerBase.prototype);
  BpMetaGraphHandler.prototype.constructor = BpMetaGraphHandler;
  DefeasiblePreferencesHandler.prototype = Object.create(DefeasiblePreferencesHandlerBase.prototype);
  DefeasiblePreferencesHandler.prototype.constructor = DefeasiblePreferencesHandler;
  GenericDefeasiblePreferencesHandler.prototype = Object.create(GenericDefeasiblePreferencesHandlerBase.prototype);
  GenericDefeasiblePreferencesHandler.prototype.constructor = GenericDefeasiblePreferencesHandler;
  StrictPreferencesHandler.prototype = Object.create(StrictPreferencesHandlerBase.prototype);
  StrictPreferencesHandler.prototype.constructor = StrictPreferencesHandler;
  BpCompleteLabeller.prototype = Object.create(BpCompleteLabellerBase.prototype);
  BpCompleteLabeller.prototype.constructor = BpCompleteLabeller;
  BpLabeller.prototype = Object.create(BpLabellerBase.prototype);
  BpLabeller.prototype.constructor = BpLabeller;
  BpPartialLabeller.prototype = Object.create(BpPartialLabellerBase.prototype);
  BpPartialLabeller.prototype.constructor = BpPartialLabeller;
  CompleteLabeller.prototype = Object.create(CompleteLabellerBase.prototype);
  CompleteLabeller.prototype.constructor = CompleteLabeller;
  GroundedLabeller.prototype = Object.create(GroundedLabellerBase.prototype);
  GroundedLabeller.prototype.constructor = GroundedLabeller;
  StatementLabeller.prototype = Object.create(StatementLabellerBase.prototype);
  StatementLabeller.prototype.constructor = StatementLabeller;
  RuleParser.prototype = Object.create(RuleParserBase.prototype);
  RuleParser.prototype.constructor = RuleParser;
  StructuredMode.prototype = Object.create(StructuredModeBase.prototype);
  StructuredMode.prototype.constructor = StructuredMode;
  Debug_0.prototype = Object.create(DebugBase.prototype);
  Debug_0.prototype.constructor = Debug_0;
  SuperiorityRelation_0.prototype = Object.create(SuperiorityRelationBase.prototype);
  SuperiorityRelation_0.prototype.constructor = SuperiorityRelation_0;
  Utils_0.prototype = Object.create(UtilsBase.prototype);
  Utils_0.prototype.constructor = Utils_0;
  function Arg2pSolver() {
    Arg2pSolver$Companion_getInstance();
  }
  Arg2pSolver.prototype.to2pLibraries = function () {
    var tmp$ = Libraries.Companion;
    var $receiver = plus(listOf(this.loader), this.staticLibraries());
    var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
    var tmp$_0;
    tmp$_0 = $receiver.iterator();
    while (tmp$_0.hasNext()) {
      var item = tmp$_0.next();
      destination.add_11rb$(item.content());
    }
    return tmp$.ofIterable(destination);
  };
  Arg2pSolver.prototype.operators = function () {
    var $receiver = plus(listOf(this.loader), this.staticLibraries());
    var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
    var tmp$;
    tmp$ = $receiver.iterator();
    while (tmp$.hasNext()) {
      var item = tmp$.next();
      destination.add_11rb$(item.theoryOperators);
    }
    var iterator = destination.iterator();
    if (!iterator.hasNext())
      throw UnsupportedOperationException_init("Empty collection can't be reduced.");
    var accumulator = iterator.next();
    while (iterator.hasNext()) {
      accumulator = accumulator.plusOperatorSet(iterator.next());
    }
    return accumulator;
  };
  function Arg2pSolver$Companion() {
    Arg2pSolver$Companion_instance = this;
  }
  function Arg2pSolver$Companion$of$ObjectLiteral(closure$staticLibs, closure$dynamicLibs) {
    this.closure$staticLibs = closure$staticLibs;
    this.closure$dynamicLibs = closure$dynamicLibs;
    this.loader_gxu4sn$_0 = new DynamicLoader(this);
    var $receiver = this.operators();
    var tmp$;
    tmp$ = closure$staticLibs.iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      element.theoryOperators = $receiver;
    }
    var tmp$_0;
    tmp$_0 = closure$dynamicLibs.iterator();
    while (tmp$_0.hasNext()) {
      var element_0 = tmp$_0.next();
      element_0.theoryOperators = $receiver;
    }
  }
  Object.defineProperty(Arg2pSolver$Companion$of$ObjectLiteral.prototype, 'loader', {
    configurable: true,
    get: function () {
      return this.loader_gxu4sn$_0;
    }
  });
  Arg2pSolver$Companion$of$ObjectLiteral.prototype.staticLibraries = function () {
    return this.closure$staticLibs;
  };
  Arg2pSolver$Companion$of$ObjectLiteral.prototype.dynamicLibraries = function () {
    return this.closure$dynamicLibs;
  };
  Arg2pSolver$Companion$of$ObjectLiteral.$metadata$ = {
    kind: Kind_CLASS,
    interfaces: [Arg2pSolver]
  };
  Arg2pSolver$Companion.prototype.of_gdqvf0$ = function (staticLibs, dynamicLibs) {
    return new Arg2pSolver$Companion$of$ObjectLiteral(staticLibs, dynamicLibs);
  };
  Arg2pSolver$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var Arg2pSolver$Companion_instance = null;
  function Arg2pSolver$Companion_getInstance() {
    if (Arg2pSolver$Companion_instance === null) {
      new Arg2pSolver$Companion();
    }return Arg2pSolver$Companion_instance;
  }
  Arg2pSolver.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'Arg2pSolver',
    interfaces: []
  };
  function arg2p() {
    return Arg2pSolver$Companion_getInstance().of_gdqvf0$(listOf_0([EngineInterface_getInstance(), new Context(), new Cache()]), listOf_0([Utils_getInstance_0(), Debug_getInstance_0(), RuleParser_getInstance(), MetaInterpreter_getInstance(), ModuleCalls_getInstance(), ArgumentationGraphBuilder_getInstance(), AttackRestrictionHandler_getInstance(), BpMetaGraphHandler_getInstance(), DefeasiblePreferencesHandler_getInstance(), GenericDefeasiblePreferencesHandler_getInstance(), StrictPreferencesHandler_getInstance(), BpLabeller_getInstance(), CompleteLabeller_getInstance(), GroundedLabeller_getInstance(), StatementLabeller_getInstance(), AbstractMode_getInstance(), StructuredMode_getInstance(), SuperiorityRelation_getInstance_0(), BpPartialLabeller_getInstance(), BpCompleteLabeller_getInstance()]));
  }
  function PrologWithArgumentation() {
  }
  PrologWithArgumentation.prototype.call_k9kufj$ = function ($receiver, other) {
    return this.structOf('::', [this.anyToTerm($receiver), this.anyToTerm(other)]);
  };
  PrologWithArgumentation.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'PrologWithArgumentation',
    interfaces: [PrologScopeWithTheories]
  };
  function PrologWithArgumentationImpl() {
    this.$delegate_38xz9p$_0 = PrologScope.Companion.empty();
    this.$delegate_38xz9p$_1 = Unificator.Companion.default;
  }
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'A', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.A;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'B', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.B;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'C', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.C;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'D', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.D;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'E', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.E;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'F', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.F;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'G', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.G;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'H', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.H;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'I', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.I;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'J', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.J;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'K', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.K;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'L', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.L;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'M', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.M;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'N', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.N;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'O', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.O;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'P', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.P;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'Q', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.Q;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'R', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.R;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'S', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.S;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'T', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.T;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'U', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.U;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'V', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.V;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'W', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.W;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'X', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.X;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'Y', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.Y;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'Z', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.Z;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, '_', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0._;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'at_end_of_stream', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.at_end_of_stream;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'cut', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.cut;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'emptyBlock', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.emptyBlock;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'emptyList', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.emptyList;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'fail', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.fail;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'halt', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.halt;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'nl', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.nl;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'repeat', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.repeat;
    }
  });
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'variables', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_0.variables;
    }
  });
  PrologWithArgumentationImpl.prototype.abolish1 = function (indicator) {
    return this.$delegate_38xz9p$_0.abolish1(indicator);
  };
  PrologWithArgumentationImpl.prototype.anonymous = function () {
    return this.$delegate_38xz9p$_0.anonymous();
  };
  PrologWithArgumentationImpl.prototype.append3 = function (left, right, result) {
    return this.$delegate_38xz9p$_0.append3(left, right, result);
  };
  PrologWithArgumentationImpl.prototype.arg3 = function (index, compound, argument) {
    return this.$delegate_38xz9p$_0.arg3(index, compound, argument);
  };
  PrologWithArgumentationImpl.prototype.assert1 = function (clause) {
    return this.$delegate_38xz9p$_0.assert1(clause);
  };
  PrologWithArgumentationImpl.prototype.asserta1 = function (clause) {
    return this.$delegate_38xz9p$_0.asserta1(clause);
  };
  PrologWithArgumentationImpl.prototype.assertz1 = function (clause) {
    return this.$delegate_38xz9p$_0.assertz1(clause);
  };
  PrologWithArgumentationImpl.prototype.at_end_of_stream1 = function (alias) {
    return this.$delegate_38xz9p$_0.at_end_of_stream1(alias);
  };
  PrologWithArgumentationImpl.prototype.atom1 = function (atom) {
    return this.$delegate_38xz9p$_0.atom1(atom);
  };
  PrologWithArgumentationImpl.prototype.atomOf = function (value) {
    return this.$delegate_38xz9p$_0.atomOf(value);
  };
  PrologWithArgumentationImpl.prototype.atom_chars2 = function (atom, chars) {
    return this.$delegate_38xz9p$_0.atom_chars2(atom, chars);
  };
  PrologWithArgumentationImpl.prototype.atom_codes2 = function (atom, codes) {
    return this.$delegate_38xz9p$_0.atom_codes2(atom, codes);
  };
  PrologWithArgumentationImpl.prototype.atom_concat3 = function (first, second, result) {
    return this.$delegate_38xz9p$_0.atom_concat3(first, second, result);
  };
  PrologWithArgumentationImpl.prototype.atom_length2 = function (atom, length) {
    return this.$delegate_38xz9p$_0.atom_length2(atom, length);
  };
  PrologWithArgumentationImpl.prototype.atomic1 = function (atomic) {
    return this.$delegate_38xz9p$_0.atomic1(atomic);
  };
  PrologWithArgumentationImpl.prototype.bagof3 = function (template, goal, bag) {
    return this.$delegate_38xz9p$_0.bagof3(template, goal, bag);
  };
  PrologWithArgumentationImpl.prototype.between3 = function (min, max, number) {
    return this.$delegate_38xz9p$_0.between3(min, max, number);
  };
  PrologWithArgumentationImpl.prototype.setOf = function (terms) {
    return this.$delegate_38xz9p$_0.setOf(terms);
  };
  PrologWithArgumentationImpl.prototype.blockOf = function (terms) {
    return this.$delegate_38xz9p$_0.blockOf(terms);
  };
  PrologWithArgumentationImpl.prototype.setOfIterable = function (terms) {
    return this.$delegate_38xz9p$_0.setOfIterable(terms);
  };
  PrologWithArgumentationImpl.prototype.setOfSequence = function (terms) {
    return this.$delegate_38xz9p$_0.setOfSequence(terms);
  };
  PrologWithArgumentationImpl.prototype.call1 = function (goal) {
    return this.$delegate_38xz9p$_0.call1(goal);
  };
  PrologWithArgumentationImpl.prototype.callable1 = function (goal) {
    return this.$delegate_38xz9p$_0.callable1(goal);
  };
  PrologWithArgumentationImpl.prototype.catch3 = function (goal, error, continuation) {
    return this.$delegate_38xz9p$_0.catch3(goal, error, continuation);
  };
  PrologWithArgumentationImpl.prototype.char_code2 = function (char, code) {
    return this.$delegate_38xz9p$_0.char_code2(char, code);
  };
  PrologWithArgumentationImpl.prototype.clause_fzbqwd$ = function (function_0) {
    return this.$delegate_38xz9p$_0.clause_fzbqwd$(function_0);
  };
  PrologWithArgumentationImpl.prototype.clause2 = function (head, body) {
    return this.$delegate_38xz9p$_0.clause2(head, body);
  };
  PrologWithArgumentationImpl.prototype.clauseOf = function (head, body) {
    return this.$delegate_38xz9p$_0.clauseOf(head, body);
  };
  PrologWithArgumentationImpl.prototype.compound1 = function (struct) {
    return this.$delegate_38xz9p$_0.compound1(struct);
  };
  PrologWithArgumentationImpl.prototype.consOf = function (head, tail) {
    return this.$delegate_38xz9p$_0.consOf(head, tail);
  };
  PrologWithArgumentationImpl.prototype.consOfAny = function (head, tail) {
    return this.$delegate_38xz9p$_0.consOfAny(head, tail);
  };
  PrologWithArgumentationImpl.prototype.consult1 = function (url) {
    return this.$delegate_38xz9p$_0.consult1(url);
  };
  PrologWithArgumentationImpl.prototype.containsVar = function (variable) {
    return this.$delegate_38xz9p$_0.containsVar(variable);
  };
  PrologWithArgumentationImpl.prototype.contains = function (variable) {
    return this.$delegate_38xz9p$_0.contains(variable);
  };
  PrologWithArgumentationImpl.prototype.copy_term2 = function (term, copy) {
    return this.$delegate_38xz9p$_0.copy_term2(term, copy);
  };
  PrologWithArgumentationImpl.prototype.current_flag2 = function (name, value) {
    return this.$delegate_38xz9p$_0.current_flag2(name, value);
  };
  PrologWithArgumentationImpl.prototype.current_op3 = function (precedence, specifier, functor) {
    return this.$delegate_38xz9p$_0.current_op3(precedence, specifier, functor);
  };
  PrologWithArgumentationImpl.prototype.current_prolog_flag2 = function (name, value) {
    return this.$delegate_38xz9p$_0.current_prolog_flag2(name, value);
  };
  PrologWithArgumentationImpl.prototype.directive = function (function_0) {
    return this.$delegate_38xz9p$_0.directive(function_0);
  };
  PrologWithArgumentationImpl.prototype.directiveOf = function (body1, body) {
    return this.$delegate_38xz9p$_0.directiveOf(body1, body);
  };
  PrologWithArgumentationImpl.prototype.directiveOfAny = function (term, terms) {
    return this.$delegate_38xz9p$_0.directiveOfAny(term, terms);
  };
  PrologWithArgumentationImpl.prototype.dynamic1 = function (indicator) {
    return this.$delegate_38xz9p$_0.dynamic1(indicator);
  };
  PrologWithArgumentationImpl.prototype.fact = function (function_0) {
    return this.$delegate_38xz9p$_0.fact(function_0);
  };
  PrologWithArgumentationImpl.prototype.factOf = function (head) {
    return this.$delegate_38xz9p$_0.factOf(head);
  };
  PrologWithArgumentationImpl.prototype.factOfAny = function (term) {
    return this.$delegate_38xz9p$_0.factOfAny(term);
  };
  PrologWithArgumentationImpl.prototype.findall3 = function (template, goal, bag) {
    return this.$delegate_38xz9p$_0.findall3(template, goal, bag);
  };
  PrologWithArgumentationImpl.prototype.float1 = function (number) {
    return this.$delegate_38xz9p$_0.float1(number);
  };
  PrologWithArgumentationImpl.prototype.functor3 = function (struct, functor, arity) {
    return this.$delegate_38xz9p$_0.functor3(struct, functor, arity);
  };
  PrologWithArgumentationImpl.prototype.get = function (variable) {
    return this.$delegate_38xz9p$_0.get(variable);
  };
  PrologWithArgumentationImpl.prototype.ground1 = function (term) {
    return this.$delegate_38xz9p$_0.ground1(term);
  };
  PrologWithArgumentationImpl.prototype.include1 = function (url) {
    return this.$delegate_38xz9p$_0.include1(url);
  };
  PrologWithArgumentationImpl.prototype.indicatorOf = function (name, arity) {
    return this.$delegate_38xz9p$_0.indicatorOf(name, arity);
  };
  PrologWithArgumentationImpl.prototype.indicatorOfStringInt = function (name, arity) {
    return this.$delegate_38xz9p$_0.indicatorOfStringInt(name, arity);
  };
  PrologWithArgumentationImpl.prototype.initialization1 = function (goal) {
    return this.$delegate_38xz9p$_0.initialization1(goal);
  };
  PrologWithArgumentationImpl.prototype.intOfByte = function (value) {
    return this.$delegate_38xz9p$_0.intOfByte(value);
  };
  PrologWithArgumentationImpl.prototype.intOf = function (value) {
    return this.$delegate_38xz9p$_0.intOf(value);
  };
  PrologWithArgumentationImpl.prototype.intOfLong = function (value) {
    return this.$delegate_38xz9p$_0.intOfLong(value);
  };
  PrologWithArgumentationImpl.prototype.intOfShort = function (value) {
    return this.$delegate_38xz9p$_0.intOfShort(value);
  };
  PrologWithArgumentationImpl.prototype.parseInt = function (value) {
    return this.$delegate_38xz9p$_0.parseInt(value);
  };
  PrologWithArgumentationImpl.prototype.parseIntRadix = function (value, radix) {
    return this.$delegate_38xz9p$_0.parseIntRadix(value, radix);
  };
  PrologWithArgumentationImpl.prototype.intOfBigInteger = function (value) {
    return this.$delegate_38xz9p$_0.intOfBigInteger(value);
  };
  PrologWithArgumentationImpl.prototype.integer1 = function (number) {
    return this.$delegate_38xz9p$_0.integer1(number);
  };
  PrologWithArgumentationImpl.prototype.ktEmptyList = function () {
    return this.$delegate_38xz9p$_0.ktEmptyList();
  };
  PrologWithArgumentationImpl.prototype.ktEmptySet = function () {
    return this.$delegate_38xz9p$_0.ktEmptySet();
  };
  PrologWithArgumentationImpl.prototype.ktListOf = function (items) {
    return this.$delegate_38xz9p$_0.ktListOf(items);
  };
  PrologWithArgumentationImpl.prototype.ktSetOf = function (items) {
    return this.$delegate_38xz9p$_0.ktSetOf(items);
  };
  PrologWithArgumentationImpl.prototype.list$default = function (items, tail) {
    return this.$delegate_38xz9p$_0.list$default(items, tail);
  };
  PrologWithArgumentationImpl.prototype.listFrom$default = function (terms, last) {
    return this.$delegate_38xz9p$_0.listFrom$default(terms, last);
  };
  PrologWithArgumentationImpl.prototype.listFromIterable$default = function (terms, last) {
    return this.$delegate_38xz9p$_0.listFromIterable$default(terms, last);
  };
  PrologWithArgumentationImpl.prototype.listFromSequence$default = function (terms, last) {
    return this.$delegate_38xz9p$_0.listFromSequence$default(terms, last);
  };
  PrologWithArgumentationImpl.prototype.listOf = function (terms) {
    return this.$delegate_38xz9p$_0.listOf(terms);
  };
  PrologWithArgumentationImpl.prototype.listOfAny = function (terms) {
    return this.$delegate_38xz9p$_0.listOfAny(terms);
  };
  PrologWithArgumentationImpl.prototype.listOfIterable = function (terms) {
    return this.$delegate_38xz9p$_0.listOfIterable(terms);
  };
  PrologWithArgumentationImpl.prototype.listOfSequence = function (terms) {
    return this.$delegate_38xz9p$_0.listOfSequence(terms);
  };
  PrologWithArgumentationImpl.prototype.load1 = function (url) {
    return this.$delegate_38xz9p$_0.load1(url);
  };
  PrologWithArgumentationImpl.prototype.member2 = function (item, list) {
    return this.$delegate_38xz9p$_0.member2(item, list);
  };
  PrologWithArgumentationImpl.prototype.naf1 = function (goal) {
    return this.$delegate_38xz9p$_0.naf1(goal);
  };
  PrologWithArgumentationImpl.prototype.natural = function (number) {
    return this.$delegate_38xz9p$_0.natural(number);
  };
  PrologWithArgumentationImpl.prototype.nonvar1 = function (number) {
    return this.$delegate_38xz9p$_0.nonvar1(number);
  };
  PrologWithArgumentationImpl.prototype.not1 = function (goal) {
    return this.$delegate_38xz9p$_0.not1(goal);
  };
  PrologWithArgumentationImpl.prototype.numOfByte = function (value) {
    return this.$delegate_38xz9p$_0.numOfByte(value);
  };
  PrologWithArgumentationImpl.prototype.numOfDouble = function (value) {
    return this.$delegate_38xz9p$_0.numOfDouble(value);
  };
  PrologWithArgumentationImpl.prototype.numOfFloat = function (value) {
    return this.$delegate_38xz9p$_0.numOfFloat(value);
  };
  PrologWithArgumentationImpl.prototype.numOfInt = function (value) {
    return this.$delegate_38xz9p$_0.numOfInt(value);
  };
  PrologWithArgumentationImpl.prototype.numOfLong = function (value) {
    return this.$delegate_38xz9p$_0.numOfLong(value);
  };
  PrologWithArgumentationImpl.prototype.numOf = function (value) {
    return this.$delegate_38xz9p$_0.numOf(value);
  };
  PrologWithArgumentationImpl.prototype.numOfShort = function (value) {
    return this.$delegate_38xz9p$_0.numOfShort(value);
  };
  PrologWithArgumentationImpl.prototype.parseNum = function (value) {
    return this.$delegate_38xz9p$_0.parseNum(value);
  };
  PrologWithArgumentationImpl.prototype.numOfBigDecimal = function (value) {
    return this.$delegate_38xz9p$_0.numOfBigDecimal(value);
  };
  PrologWithArgumentationImpl.prototype.numOfBigInteger = function (value) {
    return this.$delegate_38xz9p$_0.numOfBigInteger(value);
  };
  PrologWithArgumentationImpl.prototype.number1 = function (number) {
    return this.$delegate_38xz9p$_0.number1(number);
  };
  PrologWithArgumentationImpl.prototype.number_chars2 = function (first, second) {
    return this.$delegate_38xz9p$_0.number_chars2(first, second);
  };
  PrologWithArgumentationImpl.prototype.number_codes2 = function (first, second) {
    return this.$delegate_38xz9p$_0.number_codes2(first, second);
  };
  PrologWithArgumentationImpl.prototype.op3 = function (precedence, specifier, functor) {
    return this.$delegate_38xz9p$_0.op3(precedence, specifier, functor);
  };
  PrologWithArgumentationImpl.prototype.realOf = function (value) {
    return this.$delegate_38xz9p$_0.realOf(value);
  };
  PrologWithArgumentationImpl.prototype.realOfFloat = function (value) {
    return this.$delegate_38xz9p$_0.realOfFloat(value);
  };
  PrologWithArgumentationImpl.prototype.parseReal = function (value) {
    return this.$delegate_38xz9p$_0.parseReal(value);
  };
  PrologWithArgumentationImpl.prototype.realOfBigDecimal = function (value) {
    return this.$delegate_38xz9p$_0.realOfBigDecimal(value);
  };
  PrologWithArgumentationImpl.prototype.retract1 = function (clause) {
    return this.$delegate_38xz9p$_0.retract1(clause);
  };
  PrologWithArgumentationImpl.prototype.retractall1 = function (clause) {
    return this.$delegate_38xz9p$_0.retractall1(clause);
  };
  PrologWithArgumentationImpl.prototype.rule = function (function_0) {
    return this.$delegate_38xz9p$_0.rule(function_0);
  };
  PrologWithArgumentationImpl.prototype.ruleOf = function (head, body1, body) {
    return this.$delegate_38xz9p$_0.ruleOf(head, body1, body);
  };
  PrologWithArgumentationImpl.prototype.scope = function (function_0) {
    return this.$delegate_38xz9p$_0.scope(function_0);
  };
  PrologWithArgumentationImpl.prototype.set_flag2 = function (name, value) {
    return this.$delegate_38xz9p$_0.set_flag2(name, value);
  };
  PrologWithArgumentationImpl.prototype.set_prolog_flag2 = function (name, value) {
    return this.$delegate_38xz9p$_0.set_prolog_flag2(name, value);
  };
  PrologWithArgumentationImpl.prototype.setof3 = function (template, goal, bag) {
    return this.$delegate_38xz9p$_0.setof3(template, goal, bag);
  };
  PrologWithArgumentationImpl.prototype.solve1 = function (goal) {
    return this.$delegate_38xz9p$_0.solve1(goal);
  };
  PrologWithArgumentationImpl.prototype.static1 = function (indicator) {
    return this.$delegate_38xz9p$_0.static1(indicator);
  };
  PrologWithArgumentationImpl.prototype.structOf = function (functor, args) {
    return this.$delegate_38xz9p$_0.structOf(functor, args);
  };
  PrologWithArgumentationImpl.prototype.structOfAny = function (functor, args) {
    return this.$delegate_38xz9p$_0.structOfAny(functor, args);
  };
  PrologWithArgumentationImpl.prototype.structOfIterable = function (functor, args) {
    return this.$delegate_38xz9p$_0.structOfIterable(functor, args);
  };
  PrologWithArgumentationImpl.prototype.structOfList = function (functor, args) {
    return this.$delegate_38xz9p$_0.structOfList(functor, args);
  };
  PrologWithArgumentationImpl.prototype.structOfSequence = function (functor, args) {
    return this.$delegate_38xz9p$_0.structOfSequence(functor, args);
  };
  PrologWithArgumentationImpl.prototype.sub_atom5 = function (atom, before, length, after, sub_atom) {
    return this.$delegate_38xz9p$_0.sub_atom5(atom, before, length, after, sub_atom);
  };
  PrologWithArgumentationImpl.prototype.throw1 = function (error) {
    return this.$delegate_38xz9p$_0.throw1(error);
  };
  PrologWithArgumentationImpl.prototype.truthOf = function (value) {
    return this.$delegate_38xz9p$_0.truthOf(value);
  };
  PrologWithArgumentationImpl.prototype.tupleOf = function (terms) {
    return this.$delegate_38xz9p$_0.tupleOf(terms);
  };
  PrologWithArgumentationImpl.prototype.tupleOfAny = function (terms) {
    return this.$delegate_38xz9p$_0.tupleOfAny(terms);
  };
  PrologWithArgumentationImpl.prototype.tupleOfIterable = function (terms) {
    return this.$delegate_38xz9p$_0.tupleOfIterable(terms);
  };
  PrologWithArgumentationImpl.prototype.tupleOfSequence = function (terms) {
    return this.$delegate_38xz9p$_0.tupleOfSequence(terms);
  };
  PrologWithArgumentationImpl.prototype.var1 = function (term) {
    return this.$delegate_38xz9p$_0.var1(term);
  };
  PrologWithArgumentationImpl.prototype.varOf = function (name) {
    return this.$delegate_38xz9p$_0.varOf(name);
  };
  PrologWithArgumentationImpl.prototype.whatever = function () {
    return this.$delegate_38xz9p$_0.whatever();
  };
  PrologWithArgumentationImpl.prototype.where = function (lambda) {
    return this.$delegate_38xz9p$_0.where(lambda);
  };
  PrologWithArgumentationImpl.prototype.with = function (lambda) {
    return this.$delegate_38xz9p$_0.with(lambda);
  };
  PrologWithArgumentationImpl.prototype.write1 = function (term) {
    return this.$delegate_38xz9p$_0.write1(term);
  };
  PrologWithArgumentationImpl.prototype.neq2 = function ($receiver, right) {
    return this.$delegate_38xz9p$_0.neq2($receiver, right);
  };
  PrologWithArgumentationImpl.prototype.nid2 = function ($receiver, right) {
    return this.$delegate_38xz9p$_0.nid2($receiver, right);
  };
  PrologWithArgumentationImpl.prototype.power = function ($receiver, right) {
    return this.$delegate_38xz9p$_0.power($receiver, right);
  };
  PrologWithArgumentationImpl.prototype.eq2 = function ($receiver, right) {
    return this.$delegate_38xz9p$_0.eq2($receiver, right);
  };
  PrologWithArgumentationImpl.prototype.arithNeq2 = function ($receiver, right) {
    return this.$delegate_38xz9p$_0.arithNeq2($receiver, right);
  };
  PrologWithArgumentationImpl.prototype.id2 = function ($receiver, right) {
    return this.$delegate_38xz9p$_0.id2($receiver, right);
  };
  PrologWithArgumentationImpl.prototype.arithEq2 = function ($receiver, right) {
    return this.$delegate_38xz9p$_0.arithEq2($receiver, right);
  };
  PrologWithArgumentationImpl.prototype.pow = function ($receiver, right) {
    return this.$delegate_38xz9p$_0.pow($receiver, right);
  };
  PrologWithArgumentationImpl.prototype.anyAnd = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyAnd($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.append = function ($receiver, item, items) {
    return this.$delegate_38xz9p$_0.append($receiver, item, items);
  };
  PrologWithArgumentationImpl.prototype.concat = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.concat($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.substitutionContains = function ($receiver, term) {
    return this.$delegate_38xz9p$_0.substitutionContains($receiver, term);
  };
  PrologWithArgumentationImpl.prototype.substitutionContainsKey = function ($receiver, term) {
    return this.$delegate_38xz9p$_0.substitutionContainsKey($receiver, term);
  };
  PrologWithArgumentationImpl.prototype.substitutionContainsValue = function ($receiver, term) {
    return this.$delegate_38xz9p$_0.substitutionContainsValue($receiver, term);
  };
  PrologWithArgumentationImpl.prototype.anyDiv = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyDiv($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyEqualsTo = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyEqualsTo($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.substitutionGet = function ($receiver, term) {
    return this.$delegate_38xz9p$_0.substitutionGet($receiver, term);
  };
  PrologWithArgumentationImpl.prototype.anyGreaterThan = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyGreaterThan($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyGreaterThanOrEqualsTo = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyGreaterThanOrEqualsTo($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyIf = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyIf($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyIfVararg = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyIfVararg($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyImpliedBy = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyImpliedBy($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyImpliedByVararg = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyImpliedByVararg($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyIntDiv = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyIntDiv($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.stringInvoke = function ($receiver, term, terms) {
    return this.$delegate_38xz9p$_0.stringInvoke($receiver, term, terms);
  };
  PrologWithArgumentationImpl.prototype.anyIs = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyIs($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyLowerThan = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyLowerThan($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyLowerThanOrEqualsTo = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyLowerThanOrEqualsTo($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyMinus = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyMinus($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyNonGreaterThan = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyNonGreaterThan($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyNonLowerThan = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyNonLowerThan($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyNotEqualsTo = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyNotEqualsTo($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyOr = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyOr($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyPlus = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyPlus($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyPow = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyPow($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyRem = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyRem($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anySup = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anySup($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyThen = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyThen($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.anyTimes = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.anyTimes($receiver, other);
  };
  PrologWithArgumentationImpl.prototype.varTo = function ($receiver, termObject) {
    return this.$delegate_38xz9p$_0.varTo($receiver, termObject);
  };
  PrologWithArgumentationImpl.prototype.stringTo = function ($receiver, termObject) {
    return this.$delegate_38xz9p$_0.stringTo($receiver, termObject);
  };
  PrologWithArgumentationImpl.prototype.anyToTerm = function ($receiver) {
    return this.$delegate_38xz9p$_0.anyToTerm($receiver);
  };
  PrologWithArgumentationImpl.prototype.univ2 = function ($receiver, other) {
    return this.$delegate_38xz9p$_0.univ2($receiver, other);
  };
  Object.defineProperty(PrologWithArgumentationImpl.prototype, 'context', {
    configurable: true,
    get: function () {
      return this.$delegate_38xz9p$_1.context;
    }
  });
  PrologWithArgumentationImpl.prototype.match = function (term1, term2) {
    return this.$delegate_38xz9p$_1.match(term1, term2);
  };
  PrologWithArgumentationImpl.prototype.matchWithOccurCheck = function (term1, term2, occurCheckEnabled) {
    return this.$delegate_38xz9p$_1.matchWithOccurCheck(term1, term2, occurCheckEnabled);
  };
  PrologWithArgumentationImpl.prototype.merge = function (substitution1, substitution2) {
    return this.$delegate_38xz9p$_1.merge(substitution1, substitution2);
  };
  PrologWithArgumentationImpl.prototype.mergeWithOccurCheck = function (substitution1, substitution2, occurCheckEnabled) {
    return this.$delegate_38xz9p$_1.mergeWithOccurCheck(substitution1, substitution2, occurCheckEnabled);
  };
  PrologWithArgumentationImpl.prototype.mgu = function (term1, term2) {
    return this.$delegate_38xz9p$_1.mgu(term1, term2);
  };
  PrologWithArgumentationImpl.prototype.mguWithOccurCheck$default = function (term1, term2, occurCheckEnabled) {
    return this.$delegate_38xz9p$_1.mguWithOccurCheck$default(term1, term2, occurCheckEnabled);
  };
  PrologWithArgumentationImpl.prototype.unify = function (term1, term2) {
    return this.$delegate_38xz9p$_1.unify(term1, term2);
  };
  PrologWithArgumentationImpl.prototype.unifyWithOccurCheck = function (term1, term2, occurCheckEnabled) {
    return this.$delegate_38xz9p$_1.unifyWithOccurCheck(term1, term2, occurCheckEnabled);
  };
  PrologWithArgumentationImpl.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'PrologWithArgumentationImpl',
    interfaces: [PrologWithArgumentation, Unificator, PrologScope]
  };
  function arg2pScope(function_0) {
    return function_0(new PrologWithArgumentationImpl());
  }
  function ArgLibrary() {
  }
  ArgLibrary.prototype.flags = function () {
    return this.baseFlags;
  };
  ArgLibrary.prototype.content = function () {
    return this.baseContent;
  };
  ArgLibrary.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'ArgLibrary',
    interfaces: []
  };
  function BaseArgLibrary() {
    this.theoryOperators_ahsrz3$_0 = OperatorSet.Companion.DEFAULT;
  }
  Object.defineProperty(BaseArgLibrary.prototype, 'theoryOperators', {
    configurable: true,
    get: function () {
      var tmp$;
      return OperatorSet.Companion.DEFAULT.plusOperatorSet(((tmp$ = this.theoryOperators_ahsrz3$_0) != null ? tmp$.equals(OperatorSet.Companion.DEFAULT) : null) ? this.theoryOperators_ahsrz3$_0 : OperatorSet.Companion.DEFAULT.plusOperatorSet(this.theoryOperators_ahsrz3$_0));
    },
    set: function (theoryOperators) {
      this.theoryOperators_ahsrz3$_0 = theoryOperators;
    }
  });
  BaseArgLibrary.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'BaseArgLibrary',
    interfaces: [ArgLibrary]
  };
  function UnionArgLibrary() {
  }
  UnionArgLibrary.prototype.flags = function () {
    return union(this.baseFlags, this.parentLibrary.flags());
  };
  UnionArgLibrary.prototype.content = function () {
    return Library.Companion.aliased(this.baseContent.alias, void 0, this.baseContent.theory.plusTheory(this.parentLibrary.content().theory));
  };
  UnionArgLibrary.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'UnionArgLibrary',
    interfaces: [ArgLibrary]
  };
  function RawPrologContent() {
  }
  RawPrologContent.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'RawPrologContent',
    interfaces: []
  };
  function LazyRawPrologContent() {
    BaseArgLibrary.call(this);
    this.prologTheory_8ne57d$_0 = lazy(LazyRawPrologContent$prologTheory$lambda(this));
  }
  Object.defineProperty(LazyRawPrologContent.prototype, 'prologTheory', {
    configurable: true,
    get: function () {
      return this.prologTheory_8ne57d$_0.value;
    }
  });
  function LazyRawPrologContent$prologTheory$lambda(this$LazyRawPrologContent) {
    return function () {
      return parse(Theory.Companion, this$LazyRawPrologContent.prologRawTheory, this$LazyRawPrologContent.theoryOperators);
    };
  }
  LazyRawPrologContent.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'LazyRawPrologContent',
    interfaces: [RawPrologContent, BaseArgLibrary]
  };
  function Loadable() {
  }
  Loadable.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'Loadable',
    interfaces: []
  };
  function ArgsFlag() {
  }
  ArgsFlag.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'ArgsFlag',
    interfaces: []
  };
  function PrimitiveWithSignature() {
  }
  PrimitiveWithSignature.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'PrimitiveWithSignature',
    interfaces: [Primitive]
  };
  function Cache() {
    BaseArgLibrary.call(this);
    var $receiver = classic(MutableSolver.Companion, void 0, void 0, Theory.Companion.empty(), MutableTheory.Companion.empty());
    $receiver.setFlag(flags.Unknown.name, flags.Unknown.FAIL);
    this.solver_0 = $receiver;
    this.alias_9zj9cx$_0 = 'prolog.argumentation.cache';
  }
  function Cache$CacheAssert($outer) {
    this.$outer = $outer;
    this.signature_rygzz7$_0 = new Signature('cache_assert', 1);
  }
  Object.defineProperty(Cache$CacheAssert.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_rygzz7$_0;
    }
  });
  Cache$CacheAssert.prototype.solve = function (request) {
    var term = request.arguments.get_za3lpa$(0);
    this.$outer.solver_0.assertAFact(term.castToStruct());
    return sequenceOf([request.replyWithCondition(true, void 0, [])]);
  };
  Cache$CacheAssert.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CacheAssert',
    interfaces: [PrimitiveWithSignature]
  };
  function Cache$CacheRetract($outer) {
    this.$outer = $outer;
    this.signature_v7ocho$_0 = new Signature('cache_retract', 1);
  }
  Object.defineProperty(Cache$CacheRetract.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_v7ocho$_0;
    }
  });
  Cache$CacheRetract.prototype.solve = function (request) {
    var term = request.arguments.get_za3lpa$(0);
    this.$outer.solver_0.retractAllBeHead(term.castToStruct());
    return sequenceOf([request.replyWithCondition(true, void 0, [])]);
  };
  Cache$CacheRetract.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CacheRetract',
    interfaces: [PrimitiveWithSignature]
  };
  function Cache$CacheGet($outer) {
    this.$outer = $outer;
    this.signature_ctt1s7$_0 = new Signature('cache_check', 1);
  }
  Object.defineProperty(Cache$CacheGet.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_ctt1s7$_0;
    }
  });
  function Cache$CacheGet$solve$lambda$lambda(closure$request) {
    return function (it) {
      return closure$request.replyWith(it.substitution, void 0, []);
    };
  }
  function Coroutine$Cache$CacheGet$solve$lambda(this$Cache_0, closure$term_0, closure$request_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$this$Cache = this$Cache_0;
    this.local$closure$term = closure$term_0;
    this.local$closure$request = closure$request_0;
    this.local$$receiver = $receiver_0;
  }
  Coroutine$Cache$CacheGet$solve$lambda.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: null,
    interfaces: [CoroutineImpl]
  };
  Coroutine$Cache$CacheGet$solve$lambda.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$Cache$CacheGet$solve$lambda.prototype.constructor = Coroutine$Cache$CacheGet$solve$lambda;
  Coroutine$Cache$CacheGet$solve$lambda.prototype.doResume = function () {
    do
      try {
        switch (this.state_0) {
          case 0:
            this.state_0 = 2;
            this.result_0 = this.local$$receiver.yieldAll_swo9gw$(map(this.local$this$Cache.solver_0.solve(this.local$closure$term.castToStruct()), Cache$CacheGet$solve$lambda$lambda(this.local$closure$request)), this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 1:
            throw this.exception_0;
          case 2:
            return this.result_0;
          default:this.state_0 = 1;
            throw new Error('State Machine Unreachable execution');
        }
      } catch (e) {
        if (this.state_0 === 1) {
          this.exceptionState_0 = this.state_0;
          throw e;
        } else {
          this.state_0 = this.exceptionState_0;
          this.exception_0 = e;
        }
      }
     while (true);
  };
  function Cache$CacheGet$solve$lambda(this$Cache_0, closure$term_0, closure$request_0) {
    return function ($receiver_0, continuation_0, suspended) {
      var instance = new Coroutine$Cache$CacheGet$solve$lambda(this$Cache_0, closure$term_0, closure$request_0, $receiver_0, this, continuation_0);
      if (suspended)
        return instance;
      else
        return instance.doResume(null);
    };
  }
  Cache$CacheGet.prototype.solve = function (request) {
    var term = request.arguments.get_za3lpa$(0);
    return sequence(Cache$CacheGet$solve$lambda(this.$outer, term, request));
  };
  Cache$CacheGet.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CacheGet',
    interfaces: [PrimitiveWithSignature]
  };
  Object.defineProperty(Cache.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_9zj9cx$_0;
    }
  });
  Object.defineProperty(Cache.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      var primitives = listOf_0([new Cache$CacheAssert(this), new Cache$CacheRetract(this), new Cache$CacheGet(this)]);
      var tmp$ = Library.Companion;
      var tmp$_0 = this.alias;
      var capacity = coerceAtLeast(mapCapacity(collectionSizeOrDefault(primitives, 10)), 16);
      var destination = LinkedHashMap_init(capacity);
      var tmp$_1;
      tmp$_1 = primitives.iterator();
      while (tmp$_1.hasNext()) {
        var element = tmp$_1.next();
        destination.put_xwzc9p$(element.signature, element);
      }
      return tmp$.aliased(tmp$_0, destination);
    }
  });
  Object.defineProperty(Cache.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  Cache.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Cache',
    interfaces: [BaseArgLibrary]
  };
  function Context() {
    BaseArgLibrary.call(this);
    this.nextSolver_0 = 1;
    this.selectedSolver_0 = 0;
    var $receiver = classic(MutableSolver.Companion, void 0, void 0, Theory.Companion.empty(), MutableTheory.Companion.empty());
    $receiver.setFlag(flags.Unknown.name, flags.Unknown.FAIL);
    this.dynamicSolver_0 = mutableMapOf([to(0, $receiver)]);
    this.alias_476cz2$_0 = 'prolog.argumentation.context';
  }
  function Context$DynamicCacheReset($outer) {
    this.$outer = $outer;
    this.signature_2h7q5o$_0 = new Signature('context_reset', 0);
  }
  Object.defineProperty(Context$DynamicCacheReset.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_2h7q5o$_0;
    }
  });
  Context$DynamicCacheReset.prototype.solve = function (request) {
    this.$outer.selectedSolver_0 = 0;
    this.$outer.nextSolver_0 = 1;
    this.$outer.dynamicSolver_0.clear();
    var tmp$ = this.$outer.dynamicSolver_0;
    var $receiver = classic(MutableSolver.Companion, void 0, void 0, Theory.Companion.empty(), MutableTheory.Companion.empty());
    $receiver.setFlag(flags.Unknown.name, flags.Unknown.FAIL);
    tmp$.put_xwzc9p$(0, $receiver);
    return sequenceOf([request.replyWithCondition(true, void 0, [])]);
  };
  Context$DynamicCacheReset.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicCacheReset',
    interfaces: [PrimitiveWithSignature]
  };
  function Context$DynamicCacheSelected($outer) {
    this.$outer = $outer;
    this.signature_mutw6$_0 = new Signature('context_active', 1);
  }
  Object.defineProperty(Context$DynamicCacheSelected.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_mutw6$_0;
    }
  });
  Context$DynamicCacheSelected.prototype.solve = function (request) {
    var term = request.arguments.get_za3lpa$(0);
    return sequenceOf([request.replyWith(Substitution.Companion.of(term.castToVar(), Numeric.Companion.ofInteger(this.$outer.selectedSolver_0)), void 0, [])]);
  };
  Context$DynamicCacheSelected.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicCacheSelected',
    interfaces: [PrimitiveWithSignature]
  };
  function Context$DynamicCacheCheckout($outer) {
    this.$outer = $outer;
    this.signature_i9b2qn$_0 = new Signature('context_checkout', 1);
  }
  Object.defineProperty(Context$DynamicCacheCheckout.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_i9b2qn$_0;
    }
  });
  Context$DynamicCacheCheckout.prototype.solve = function (request) {
    var target = request.arguments.get_za3lpa$(0).castToInteger().intValue.toInt();
    var result = this.$outer.dynamicSolver_0.keys.contains_11rb$(target);
    this.$outer.selectedSolver_0 = target;
    return sequenceOf([request.replyWithCondition(result, void 0, [])]);
  };
  Context$DynamicCacheCheckout.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicCacheCheckout',
    interfaces: [PrimitiveWithSignature]
  };
  function Context$DynamicCacheBranch($outer) {
    this.$outer = $outer;
    this.signature_m17fgj$_0 = new Signature('context_branch', 2);
  }
  Object.defineProperty(Context$DynamicCacheBranch.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_m17fgj$_0;
    }
  });
  Context$DynamicCacheBranch.prototype.solve = function (request) {
    var tmp$, tmp$_0;
    var target = request.arguments.get_za3lpa$(0).castToInteger().intValue.toInt();
    var result = request.arguments.get_za3lpa$(1);
    var tmp$_1 = this.$outer.dynamicSolver_0;
    var tmp$_2 = this.$outer.nextSolver_0;
    var $receiver = classic(MutableSolver.Companion, void 0, void 0, Theory.Companion.empty(), MutableTheory.Companion.ofIterable(ensureNotNull(this.$outer.dynamicSolver_0.get_11rb$(target)).dynamicKb));
    $receiver.setFlag(flags.Unknown.name, flags.Unknown.FAIL);
    tmp$_1.put_xwzc9p$(tmp$_2, $receiver);
    tmp$_0 = this.$outer;
    var tmp$_3;
    tmp$_3 = this.$outer;
    tmp$ = tmp$_3.nextSolver_0;
    tmp$_3.nextSolver_0 = tmp$ + 1 | 0;
    tmp$_0.selectedSolver_0 = tmp$;
    return sequenceOf([request.replyWith(Substitution.Companion.of(result.castToVar(), Numeric.Companion.ofInteger(this.$outer.selectedSolver_0)), void 0, [])]);
  };
  Context$DynamicCacheBranch.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicCacheBranch',
    interfaces: [PrimitiveWithSignature]
  };
  function Context$DynamicCacheAssert($outer) {
    this.$outer = $outer;
    this.signature_t5avxd$_0 = new Signature('context_assert', 1);
  }
  Object.defineProperty(Context$DynamicCacheAssert.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_t5avxd$_0;
    }
  });
  Context$DynamicCacheAssert.prototype.solve = function (request) {
    var term = request.arguments.get_za3lpa$(0);
    ensureNotNull(this.$outer.dynamicSolver_0.get_11rb$(this.$outer.selectedSolver_0)).assertAFact(term.castToStruct());
    return sequenceOf([request.replyWithCondition(true, void 0, [])]);
  };
  Context$DynamicCacheAssert.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicCacheAssert',
    interfaces: [PrimitiveWithSignature]
  };
  function Context$DynamicCacheRetract($outer) {
    this.$outer = $outer;
    this.signature_5o25xi$_0 = new Signature('context_retract', 1);
  }
  Object.defineProperty(Context$DynamicCacheRetract.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_5o25xi$_0;
    }
  });
  Context$DynamicCacheRetract.prototype.solve = function (request) {
    var term = request.arguments.get_za3lpa$(0);
    ensureNotNull(this.$outer.dynamicSolver_0.get_11rb$(this.$outer.selectedSolver_0)).retractAllBeHead(term.castToStruct());
    return sequenceOf([request.replyWithCondition(true, void 0, [])]);
  };
  Context$DynamicCacheRetract.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicCacheRetract',
    interfaces: [PrimitiveWithSignature]
  };
  function Context$DynamicCacheGet($outer) {
    this.$outer = $outer;
    this.signature_g5067v$_0 = new Signature('context_check', 1);
  }
  Object.defineProperty(Context$DynamicCacheGet.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_g5067v$_0;
    }
  });
  function Context$DynamicCacheGet$solve$lambda$lambda(closure$request) {
    return function (it) {
      return closure$request.replyWith(it.substitution, void 0, []);
    };
  }
  function Coroutine$Context$DynamicCacheGet$solve$lambda(this$Context_0, closure$term_0, closure$request_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$this$Context = this$Context_0;
    this.local$closure$term = closure$term_0;
    this.local$closure$request = closure$request_0;
    this.local$$receiver = $receiver_0;
  }
  Coroutine$Context$DynamicCacheGet$solve$lambda.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: null,
    interfaces: [CoroutineImpl]
  };
  Coroutine$Context$DynamicCacheGet$solve$lambda.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$Context$DynamicCacheGet$solve$lambda.prototype.constructor = Coroutine$Context$DynamicCacheGet$solve$lambda;
  Coroutine$Context$DynamicCacheGet$solve$lambda.prototype.doResume = function () {
    do
      try {
        switch (this.state_0) {
          case 0:
            this.state_0 = 2;
            this.result_0 = this.local$$receiver.yieldAll_swo9gw$(map(ensureNotNull(this.local$this$Context.dynamicSolver_0.get_11rb$(this.local$this$Context.selectedSolver_0)).solve(this.local$closure$term.castToStruct()), Context$DynamicCacheGet$solve$lambda$lambda(this.local$closure$request)), this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 1:
            throw this.exception_0;
          case 2:
            return this.result_0;
          default:this.state_0 = 1;
            throw new Error('State Machine Unreachable execution');
        }
      } catch (e) {
        if (this.state_0 === 1) {
          this.exceptionState_0 = this.state_0;
          throw e;
        } else {
          this.state_0 = this.exceptionState_0;
          this.exception_0 = e;
        }
      }
     while (true);
  };
  function Context$DynamicCacheGet$solve$lambda(this$Context_0, closure$term_0, closure$request_0) {
    return function ($receiver_0, continuation_0, suspended) {
      var instance = new Coroutine$Context$DynamicCacheGet$solve$lambda(this$Context_0, closure$term_0, closure$request_0, $receiver_0, this, continuation_0);
      if (suspended)
        return instance;
      else
        return instance.doResume(null);
    };
  }
  Context$DynamicCacheGet.prototype.solve = function (request) {
    var term = request.arguments.get_za3lpa$(0);
    return sequence(Context$DynamicCacheGet$solve$lambda(this.$outer, term, request));
  };
  Context$DynamicCacheGet.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicCacheGet',
    interfaces: [PrimitiveWithSignature]
  };
  function Context$DynamicCacheGetIndexed($outer) {
    this.$outer = $outer;
    this.signature_abym9i$_0 = new Signature('context_check', 2);
  }
  Object.defineProperty(Context$DynamicCacheGetIndexed.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_abym9i$_0;
    }
  });
  function Context$DynamicCacheGetIndexed$solve$lambda$lambda(closure$request) {
    return function (it) {
      return closure$request.replyWith(it.substitution, void 0, []);
    };
  }
  function Coroutine$Context$DynamicCacheGetIndexed$solve$lambda(this$Context_0, closure$index_0, closure$term_0, closure$request_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$this$Context = this$Context_0;
    this.local$closure$index = closure$index_0;
    this.local$closure$term = closure$term_0;
    this.local$closure$request = closure$request_0;
    this.local$$receiver = $receiver_0;
  }
  Coroutine$Context$DynamicCacheGetIndexed$solve$lambda.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: null,
    interfaces: [CoroutineImpl]
  };
  Coroutine$Context$DynamicCacheGetIndexed$solve$lambda.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$Context$DynamicCacheGetIndexed$solve$lambda.prototype.constructor = Coroutine$Context$DynamicCacheGetIndexed$solve$lambda;
  Coroutine$Context$DynamicCacheGetIndexed$solve$lambda.prototype.doResume = function () {
    do
      try {
        switch (this.state_0) {
          case 0:
            this.state_0 = 2;
            this.result_0 = this.local$$receiver.yieldAll_swo9gw$(map(ensureNotNull(this.local$this$Context.dynamicSolver_0.get_11rb$(this.local$closure$index)).solve(this.local$closure$term.castToStruct()), Context$DynamicCacheGetIndexed$solve$lambda$lambda(this.local$closure$request)), this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 1:
            throw this.exception_0;
          case 2:
            return this.result_0;
          default:this.state_0 = 1;
            throw new Error('State Machine Unreachable execution');
        }
      } catch (e) {
        if (this.state_0 === 1) {
          this.exceptionState_0 = this.state_0;
          throw e;
        } else {
          this.state_0 = this.exceptionState_0;
          this.exception_0 = e;
        }
      }
     while (true);
  };
  function Context$DynamicCacheGetIndexed$solve$lambda(this$Context_0, closure$index_0, closure$term_0, closure$request_0) {
    return function ($receiver_0, continuation_0, suspended) {
      var instance = new Coroutine$Context$DynamicCacheGetIndexed$solve$lambda(this$Context_0, closure$index_0, closure$term_0, closure$request_0, $receiver_0, this, continuation_0);
      if (suspended)
        return instance;
      else
        return instance.doResume(null);
    };
  }
  Context$DynamicCacheGetIndexed.prototype.solve = function (request) {
    var index = ensureNotNull(request.arguments.get_za3lpa$(0).asNumeric()).intValue.toInt();
    var term = request.arguments.get_za3lpa$(1);
    return sequence(Context$DynamicCacheGetIndexed$solve$lambda(this.$outer, index, term, request));
  };
  Context$DynamicCacheGetIndexed.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicCacheGetIndexed',
    interfaces: [PrimitiveWithSignature]
  };
  Object.defineProperty(Context.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_476cz2$_0;
    }
  });
  Object.defineProperty(Context.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      var primitives = listOf_0([new Context$DynamicCacheReset(this), new Context$DynamicCacheCheckout(this), new Context$DynamicCacheSelected(this), new Context$DynamicCacheBranch(this), new Context$DynamicCacheAssert(this), new Context$DynamicCacheRetract(this), new Context$DynamicCacheGet(this), new Context$DynamicCacheGetIndexed(this)]);
      var tmp$ = Library.Companion;
      var tmp$_0 = this.alias;
      var capacity = coerceAtLeast(mapCapacity(collectionSizeOrDefault(primitives, 10)), 16);
      var destination = LinkedHashMap_init(capacity);
      var tmp$_1;
      tmp$_1 = primitives.iterator();
      while (tmp$_1.hasNext()) {
        var element = tmp$_1.next();
        destination.put_xwzc9p$(element.signature, element);
      }
      return tmp$.aliased(tmp$_0, destination);
    }
  });
  Object.defineProperty(Context.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  Context.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Context',
    interfaces: [BaseArgLibrary]
  };
  function DynamicLoader(solver) {
    BaseArgLibrary.call(this);
    this.solver_0 = solver;
    this.alias_wn4lox$_0 = 'prolog.argumentation.loader';
    this.theoryOperators = OperatorSet_init([new Operator('::', Specifier.XFX, 700), new Operator(':::', Specifier.XFX, 700)]);
  }
  function DynamicLoader$AbstractWithLib($outer) {
    this.$outer = $outer;
  }
  function DynamicLoader$AbstractWithLib$solve$lambda$lambda(closure$request) {
    return function (it) {
      return closure$request.replyWith(it.substitution, void 0, []);
    };
  }
  function Coroutine$DynamicLoader$AbstractWithLib$solve$lambda(closure$solver_0, closure$goal_0, closure$request_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$closure$solver = closure$solver_0;
    this.local$closure$goal = closure$goal_0;
    this.local$closure$request = closure$request_0;
    this.local$$receiver = $receiver_0;
  }
  Coroutine$DynamicLoader$AbstractWithLib$solve$lambda.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: null,
    interfaces: [CoroutineImpl]
  };
  Coroutine$DynamicLoader$AbstractWithLib$solve$lambda.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$DynamicLoader$AbstractWithLib$solve$lambda.prototype.constructor = Coroutine$DynamicLoader$AbstractWithLib$solve$lambda;
  Coroutine$DynamicLoader$AbstractWithLib$solve$lambda.prototype.doResume = function () {
    do
      try {
        switch (this.state_0) {
          case 0:
            this.state_0 = 2;
            this.result_0 = this.local$$receiver.yieldAll_swo9gw$(map(this.local$closure$solver.solve(this.local$closure$goal), DynamicLoader$AbstractWithLib$solve$lambda$lambda(this.local$closure$request)), this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 1:
            throw this.exception_0;
          case 2:
            return this.result_0;
          default:this.state_0 = 1;
            throw new Error('State Machine Unreachable execution');
        }
      } catch (e) {
        if (this.state_0 === 1) {
          this.exceptionState_0 = this.state_0;
          throw e;
        } else {
          this.state_0 = this.exceptionState_0;
          this.exception_0 = e;
        }
      }
     while (true);
  };
  function DynamicLoader$AbstractWithLib$solve$lambda(closure$solver_0, closure$goal_0, closure$request_0) {
    return function ($receiver_0, continuation_0, suspended) {
      var instance = new Coroutine$DynamicLoader$AbstractWithLib$solve$lambda(closure$solver_0, closure$goal_0, closure$request_0, $receiver_0, this, continuation_0);
      if (suspended)
        return instance;
      else
        return instance.doResume(null);
    };
  }
  DynamicLoader$AbstractWithLib.prototype.solve = function (request) {
    var tmp$;
    var lib = request.arguments.get_za3lpa$(0);
    var goal = request.arguments.get_za3lpa$(1);
    if (!Kotlin.isType(lib, Atom)) {
      throw TypeError.Companion.forGoal(request.context, request.signature, TypeError$Expected.LIST, lib);
    }if (!Kotlin.isType(goal, Struct)) {
      throw TypeError.Companion.forGoal(request.context, request.signature, TypeError$Expected.CALLABLE, goal);
    }var $receiver = this.$outer.solver_0.dynamicLibraries();
    var firstOrNull$result;
    firstOrNull$break: do {
      var tmp$_0;
      tmp$_0 = $receiver.iterator();
      while (tmp$_0.hasNext()) {
        var element = tmp$_0.next();
        var tmp$_1;
        if (equals((Kotlin.isType(tmp$_1 = element, Loadable) ? tmp$_1 : throwCCE()).identifier(), lib.toString())) {
          firstOrNull$result = element;
          break firstOrNull$break;
        }}
      firstOrNull$result = null;
    }
     while (false);
    tmp$ = firstOrNull$result;
    if (tmp$ == null) {
      throw DomainError.Companion.forGoal(request.context, request.signature, DomainError$Expected.Companion.of('Loadable Lib'), lib);
    }this.$outer;
    var this$DynamicLoader = this.$outer;
    var tmp$_2 = request.context;
    var tmp$_3 = Libraries.Companion;
    var $receiver_0 = request.context.libraries.libraries;
    var destination = ArrayList_init_0();
    var tmp$_4;
    tmp$_4 = $receiver_0.iterator();
    while (tmp$_4.hasNext()) {
      var element_0 = tmp$_4.next();
      var $receiver_1 = this$DynamicLoader.solver_0.dynamicLibraries();
      var destination_0 = ArrayList_init(collectionSizeOrDefault($receiver_1, 10));
      var tmp$_5;
      tmp$_5 = $receiver_1.iterator();
      while (tmp$_5.hasNext()) {
        var item = tmp$_5.next();
        destination_0.add_11rb$(item.alias);
      }
      if (!destination_0.contains_11rb$(element_0.alias))
        destination.add_11rb$(element_0);
    }
    var solver = tmp$_2.createMutableSolver(tmp$_3.ofIterable(destination).plus(tmp$.content()), void 0, request.context.staticKb);
    this.execute_khyi1m$(lib.toString(), solver);
    return sequence(DynamicLoader$AbstractWithLib$solve$lambda(solver, goal, request));
  };
  DynamicLoader$AbstractWithLib.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'AbstractWithLib',
    interfaces: [Primitive]
  };
  function DynamicLoader$WithLib($outer) {
    this.$outer = $outer;
    DynamicLoader$AbstractWithLib.call(this, this.$outer);
    this.signature_il52vq$_0 = new Signature('::', 2);
  }
  Object.defineProperty(DynamicLoader$WithLib.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_il52vq$_0;
    }
  });
  DynamicLoader$WithLib.prototype.execute_khyi1m$ = function (module_0, solver) {
  };
  DynamicLoader$WithLib.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'WithLib',
    interfaces: [DynamicLoader$AbstractWithLib]
  };
  function DynamicLoader$WithLibInNewContext($outer) {
    this.$outer = $outer;
    DynamicLoader$AbstractWithLib.call(this, this.$outer);
    this.signature_6wblmq$_0 = new Signature(':::', 2);
  }
  Object.defineProperty(DynamicLoader$WithLibInNewContext.prototype, 'signature', {
    configurable: true,
    get: function () {
      return this.signature_6wblmq$_0;
    }
  });
  function DynamicLoader$WithLibInNewContext$execute$lambda$lambda(it) {
    return it.isYes;
  }
  function DynamicLoader$WithLibInNewContext$execute$lambda(closure$solver) {
    return function ($receiver) {
      var $receiver_0 = filter(closure$solver.solve($receiver.stringInvoke('context_active', $receiver.X, [])), DynamicLoader$WithLibInNewContext$execute$lambda$lambda);
      var tmp$;
      tmp$ = $receiver_0.iterator();
      while (tmp$.hasNext()) {
        var element = tmp$.next();
        first(closure$solver.solve($receiver.stringInvoke('context_branch', ensureNotNull(element.substitution.get_11rb$($receiver.X)), [$receiver._])));
      }
      return Unit;
    };
  }
  DynamicLoader$WithLibInNewContext.prototype.execute_khyi1m$ = function (module_0, solver) {
    prolog(DynamicLoader$WithLibInNewContext$execute$lambda(solver));
  };
  DynamicLoader$WithLibInNewContext.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'WithLibInNewContext',
    interfaces: [DynamicLoader$AbstractWithLib]
  };
  Object.defineProperty(DynamicLoader.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_wn4lox$_0;
    }
  });
  Object.defineProperty(DynamicLoader.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      var it = listOf_0([new DynamicLoader$WithLib(this), new DynamicLoader$WithLibInNewContext(this)]);
      var tmp$ = Library.Companion;
      var tmp$_0 = this.alias;
      var capacity = coerceAtLeast(mapCapacity(collectionSizeOrDefault(it, 10)), 16);
      var destination = LinkedHashMap_init(capacity);
      var tmp$_1;
      tmp$_1 = it.iterator();
      while (tmp$_1.hasNext()) {
        var element = tmp$_1.next();
        destination.put_xwzc9p$(element.signature, element);
      }
      return tmp$.aliased(tmp$_0, destination, void 0, OperatorSet_init([new Operator('::', Specifier.XFX, 700), new Operator(':::', Specifier.XFX, 700)]));
    }
  });
  Object.defineProperty(DynamicLoader.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  DynamicLoader.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DynamicLoader',
    interfaces: [BaseArgLibrary]
  };
  function EngineInterfaceBase() {
    LazyRawPrologContent.call(this);
    this.alias_6anqe1$_0 = 'prolog.argumentation.interface';
    this.theoryOperators = OperatorSet_init([new Operator('=>', Specifier.XFX, 1199), new Operator(':=>', Specifier.XFX, 1199), new Operator(':->', Specifier.XFX, 1199), new Operator(':', Specifier.XFX, 1001), new Operator(':=', Specifier.XFX, 1199)]);
  }
  Object.defineProperty(EngineInterfaceBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_6anqe1$_0;
    }
  });
  Object.defineProperty(EngineInterfaceBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory, OperatorSet_init([new Operator('=>', Specifier.XFX, 1199), new Operator(':=>', Specifier.XFX, 1199), new Operator(':->', Specifier.XFX, 1199), new Operator(':', Specifier.XFX, 1001), new Operator(':=', Specifier.XFX, 1199)]));
    }
  });
  Object.defineProperty(EngineInterfaceBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  EngineInterfaceBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'EngineInterfaceBase',
    interfaces: [LazyRawPrologContent, ArgLibrary]
  };
  function FlagsBuilder(queryMode, autoTransposition, prologStrictCompatibility, graphBuildMode, argumentLabellingMode, statementLabellingMode, orderingPrinciple, orderingComparator, modulesPath, graphExtensions) {
    FlagsBuilder$Companion_getInstance();
    if (queryMode === void 0)
      queryMode = QueryMode_getInstance().default();
    if (autoTransposition === void 0)
      autoTransposition = AutoTransposition_getInstance().default();
    if (prologStrictCompatibility === void 0)
      prologStrictCompatibility = PrologStrictCompatibility_getInstance().default();
    if (graphBuildMode === void 0)
      graphBuildMode = GraphBuildMode_getInstance().default();
    if (argumentLabellingMode === void 0)
      argumentLabellingMode = ArgumentLabellingMode_getInstance().default();
    if (statementLabellingMode === void 0)
      statementLabellingMode = StatementLabellingMode_getInstance().default();
    if (orderingPrinciple === void 0)
      orderingPrinciple = OrderingPrinciple_getInstance().default();
    if (orderingComparator === void 0)
      orderingComparator = OrderingComparator_getInstance().default();
    if (modulesPath === void 0)
      modulesPath = ModulesPath_getInstance().default();
    if (graphExtensions === void 0)
      graphExtensions = GraphExtension_getInstance().default();
    this.queryMode = queryMode;
    this.autoTransposition = autoTransposition;
    this.prologStrictCompatibility = prologStrictCompatibility;
    this.graphBuildMode = graphBuildMode;
    this.argumentLabellingMode = argumentLabellingMode;
    this.statementLabellingMode = statementLabellingMode;
    this.orderingPrinciple = orderingPrinciple;
    this.orderingComparator = orderingComparator;
    this.modulesPath = modulesPath;
    this.graphExtensions = graphExtensions;
  }
  function FlagsBuilder$Companion() {
    FlagsBuilder$Companion_instance = this;
  }
  FlagsBuilder$Companion.prototype.setupSolver_ds05wj$ = function (target) {
    var $receiver = MutableTheory.Companion.empty();
    var tmp$;
    tmp$ = target.graphExtensions.iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      $receiver.assertA(parse_0(Clause.Companion, GraphExtension_getInstance().predicate() + '(X) :- X = ' + element));
    }
    if (target.queryMode)
      $receiver.assertAFact(parse_1(Struct.Companion, QueryMode_getInstance().predicate()));
    if (target.autoTransposition)
      $receiver.assertAFact(parse_1(Struct.Companion, AutoTransposition_getInstance().predicate()));
    if (target.prologStrictCompatibility)
      $receiver.assertAFact(parse_1(Struct.Companion, PrologStrictCompatibility_getInstance().predicate()));
    $receiver.assertAFact(parse_1(Struct.Companion, GraphBuildMode_getInstance().predicate() + '(' + target.graphBuildMode + ')'));
    $receiver.assertAFact(parse_1(Struct.Companion, ArgumentLabellingMode_getInstance().predicate() + '(' + target.argumentLabellingMode + ')'));
    $receiver.assertAFact(parse_1(Struct.Companion, StatementLabellingMode_getInstance().predicate() + '(' + target.statementLabellingMode + ')'));
    $receiver.assertAFact(parse_1(Struct.Companion, OrderingPrinciple_getInstance().predicate() + '(' + target.orderingPrinciple + ')'));
    $receiver.assertAFact(parse_1(Struct.Companion, OrderingComparator_getInstance().predicate() + '(' + target.orderingComparator + ')'));
    $receiver.assertAFact(parse_1(Struct.Companion, ModulesPath_getInstance().predicate() + '(' + target.modulesPath + ')'));
    return $receiver;
  };
  FlagsBuilder$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var FlagsBuilder$Companion_instance = null;
  function FlagsBuilder$Companion_getInstance() {
    if (FlagsBuilder$Companion_instance === null) {
      new FlagsBuilder$Companion();
    }return FlagsBuilder$Companion_instance;
  }
  FlagsBuilder.prototype.queryMode_6taknv$ = function (queryMode) {
    this.queryMode = queryMode;
    return this;
  };
  FlagsBuilder.prototype.prologStrictCompatibility_6taknv$ = function (prologStrictCompatibility) {
    this.prologStrictCompatibility = prologStrictCompatibility;
    return this;
  };
  FlagsBuilder.prototype.graphBuildMode_61zpoe$ = function (graphBuildMode) {
    this.graphBuildMode = graphBuildMode;
    return this;
  };
  FlagsBuilder.prototype.argumentLabellingMode_61zpoe$ = function (argumentLabellingMode) {
    this.argumentLabellingMode = argumentLabellingMode;
    return this;
  };
  FlagsBuilder.prototype.statementLabellingMode_61zpoe$ = function (statementLabellingMode) {
    this.statementLabellingMode = statementLabellingMode;
    return this;
  };
  FlagsBuilder.prototype.orderingPrinciple_61zpoe$ = function (orderingPrinciple) {
    this.orderingPrinciple = orderingPrinciple;
    return this;
  };
  FlagsBuilder.prototype.orderingComparator_61zpoe$ = function (orderingComparator) {
    this.orderingComparator = orderingComparator;
    return this;
  };
  FlagsBuilder.prototype.modulesPath_61zpoe$ = function (modulesPath) {
    this.modulesPath = modulesPath;
    return this;
  };
  FlagsBuilder.prototype.graphExtensions_upaayv$ = function (graphExtensions) {
    this.graphExtensions = graphExtensions;
    return this;
  };
  function FlagsBuilder$create$ObjectLiteral(this$FlagsBuilder) {
    this.this$FlagsBuilder = this$FlagsBuilder;
    BaseArgLibrary.call(this);
    this.alias_jy93v2$_0 = 'prolog.argumentation.flags';
  }
  Object.defineProperty(FlagsBuilder$create$ObjectLiteral.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_jy93v2$_0;
    }
  });
  Object.defineProperty(FlagsBuilder$create$ObjectLiteral.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, FlagsBuilder$Companion_getInstance().setupSolver_ds05wj$(this.this$FlagsBuilder));
    }
  });
  Object.defineProperty(FlagsBuilder$create$ObjectLiteral.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  FlagsBuilder$create$ObjectLiteral.$metadata$ = {
    kind: Kind_CLASS,
    interfaces: [BaseArgLibrary]
  };
  FlagsBuilder.prototype.create = function () {
    return new FlagsBuilder$create$ObjectLiteral(this);
  };
  FlagsBuilder.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'FlagsBuilder',
    interfaces: []
  };
  FlagsBuilder.prototype.component1 = function () {
    return this.queryMode;
  };
  FlagsBuilder.prototype.component2 = function () {
    return this.autoTransposition;
  };
  FlagsBuilder.prototype.component3 = function () {
    return this.prologStrictCompatibility;
  };
  FlagsBuilder.prototype.component4 = function () {
    return this.graphBuildMode;
  };
  FlagsBuilder.prototype.component5 = function () {
    return this.argumentLabellingMode;
  };
  FlagsBuilder.prototype.component6 = function () {
    return this.statementLabellingMode;
  };
  FlagsBuilder.prototype.component7 = function () {
    return this.orderingPrinciple;
  };
  FlagsBuilder.prototype.component8 = function () {
    return this.orderingComparator;
  };
  FlagsBuilder.prototype.component9 = function () {
    return this.modulesPath;
  };
  FlagsBuilder.prototype.component10 = function () {
    return this.graphExtensions;
  };
  FlagsBuilder.prototype.copy_myjohq$ = function (queryMode, autoTransposition, prologStrictCompatibility, graphBuildMode, argumentLabellingMode, statementLabellingMode, orderingPrinciple, orderingComparator, modulesPath, graphExtensions) {
    return new FlagsBuilder(queryMode === void 0 ? this.queryMode : queryMode, autoTransposition === void 0 ? this.autoTransposition : autoTransposition, prologStrictCompatibility === void 0 ? this.prologStrictCompatibility : prologStrictCompatibility, graphBuildMode === void 0 ? this.graphBuildMode : graphBuildMode, argumentLabellingMode === void 0 ? this.argumentLabellingMode : argumentLabellingMode, statementLabellingMode === void 0 ? this.statementLabellingMode : statementLabellingMode, orderingPrinciple === void 0 ? this.orderingPrinciple : orderingPrinciple, orderingComparator === void 0 ? this.orderingComparator : orderingComparator, modulesPath === void 0 ? this.modulesPath : modulesPath, graphExtensions === void 0 ? this.graphExtensions : graphExtensions);
  };
  FlagsBuilder.prototype.toString = function () {
    return 'FlagsBuilder(queryMode=' + Kotlin.toString(this.queryMode) + (', autoTransposition=' + Kotlin.toString(this.autoTransposition)) + (', prologStrictCompatibility=' + Kotlin.toString(this.prologStrictCompatibility)) + (', graphBuildMode=' + Kotlin.toString(this.graphBuildMode)) + (', argumentLabellingMode=' + Kotlin.toString(this.argumentLabellingMode)) + (', statementLabellingMode=' + Kotlin.toString(this.statementLabellingMode)) + (', orderingPrinciple=' + Kotlin.toString(this.orderingPrinciple)) + (', orderingComparator=' + Kotlin.toString(this.orderingComparator)) + (', modulesPath=' + Kotlin.toString(this.modulesPath)) + (', graphExtensions=' + Kotlin.toString(this.graphExtensions)) + ')';
  };
  FlagsBuilder.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.queryMode) | 0;
    result = result * 31 + Kotlin.hashCode(this.autoTransposition) | 0;
    result = result * 31 + Kotlin.hashCode(this.prologStrictCompatibility) | 0;
    result = result * 31 + Kotlin.hashCode(this.graphBuildMode) | 0;
    result = result * 31 + Kotlin.hashCode(this.argumentLabellingMode) | 0;
    result = result * 31 + Kotlin.hashCode(this.statementLabellingMode) | 0;
    result = result * 31 + Kotlin.hashCode(this.orderingPrinciple) | 0;
    result = result * 31 + Kotlin.hashCode(this.orderingComparator) | 0;
    result = result * 31 + Kotlin.hashCode(this.modulesPath) | 0;
    result = result * 31 + Kotlin.hashCode(this.graphExtensions) | 0;
    return result;
  };
  FlagsBuilder.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.queryMode, other.queryMode) && Kotlin.equals(this.autoTransposition, other.autoTransposition) && Kotlin.equals(this.prologStrictCompatibility, other.prologStrictCompatibility) && Kotlin.equals(this.graphBuildMode, other.graphBuildMode) && Kotlin.equals(this.argumentLabellingMode, other.argumentLabellingMode) && Kotlin.equals(this.statementLabellingMode, other.statementLabellingMode) && Kotlin.equals(this.orderingPrinciple, other.orderingPrinciple) && Kotlin.equals(this.orderingComparator, other.orderingComparator) && Kotlin.equals(this.modulesPath, other.modulesPath) && Kotlin.equals(this.graphExtensions, other.graphExtensions)))));
  };
  function MetaInterpreter() {
    MetaInterpreter_instance = this;
    BaseArgLibrary.call(this);
    this.alias_j6xthy$_0 = 'prolog.argumentation.meta.crossjustice';
  }
  Object.defineProperty(MetaInterpreter.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_j6xthy$_0;
    }
  });
  Object.defineProperty(MetaInterpreter.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, parse_2(Theory.Companion, trimIndent('\n                % with_facts_and_length/3\n                with_facts_and_length(X, Y, L) :-\n                    solve(X, R),\n                    recover_facts(R, Y),\n                    length(Y, L).\n        \n                % lenght/2\n        \n                length([], 0).\n                length([_|T], X) :- length(T, Y), X is Y + 1.\n        \n                % recover_facts/2\n        \n                recover_facts([], []) :- !.\n                recover_facts([H|T], C) :-\n                    is_list(H), !,\n                    recover_facts(T, TC),\n                    recover_facts(H, HC),\n                    append(TC, HC, C).\n                recover_facts([H|T], C) :-\n                    \\+ is_list(H),\n                    recover_facts(T, TC),\n                    evaluate(H, HC),\n                    append(TC, HC, C).\n        \n                evaluate(user_fact(X), [X]) :- !.\n                evaluate(_, []) :- !.\n        \n                % solve/2\n        \n                solve((A,B), Result) :- !,\n                    solve(A, ARes),\n                    solve(B, BRes),\n                    append(ARes, BRes, Result).\n        \n                solve((A;B), Result) :- !,\n                    solve(A, Result);\n                    solve(B, Result).\n        \n                solve(member(A, B), [system_predicate]) :- !,\n                    call(member(A, B)).\n        \n                solve(\\+(A), [not(A)]) :- !,\n                    call(\\+(A)).\n        \n                solve((A)\\=(B), [doNotUnify(A, B)]) :- !,\n                    call((A)\\=(B)).\n        \n                solve(A, [system_predicate]) :-\n                    catch(clause(A, _), B, true),\n                    \\+ var(B), !,\n                    call(A).\n        \n                solve(A, [A]) :-\n                    \\+ clause(A, B), !,\n                    call(A).\n        \n                solve(A, [A|[Res]]) :-\n                    clause(A, B),\n                    solve(B, Res).\n        \n                % is_list/1\n        \n                is_list(X) :- var(X), !, fail.\n                is_list([]).\n                is_list([_|T]) :- is_list(T).\n                ')));
    }
  });
  Object.defineProperty(MetaInterpreter.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  MetaInterpreter.prototype.identifier = function () {
    return 'interpreter';
  };
  MetaInterpreter.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'MetaInterpreter',
    interfaces: [Loadable, BaseArgLibrary]
  };
  var MetaInterpreter_instance = null;
  function MetaInterpreter_getInstance() {
    if (MetaInterpreter_instance === null) {
      new MetaInterpreter();
    }return MetaInterpreter_instance;
  }
  function ModuleCalls() {
    ModuleCalls_instance = this;
    BaseArgLibrary.call(this);
    this.alias_46d2ju$_0 = 'prolog.argumentation.modularity';
  }
  Object.defineProperty(ModuleCalls.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_46d2ju$_0;
    }
  });
  Object.defineProperty(ModuleCalls.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, mapOf(to(ModuleCall_getInstance().signature, ModuleCall_getInstance())));
    }
  });
  Object.defineProperty(ModuleCalls.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return listOf(ModulesPath_getInstance());
    }
  });
  ModuleCalls.prototype.identifier = function () {
    return 'module';
  };
  ModuleCalls.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ModuleCalls',
    interfaces: [Loadable, BaseArgLibrary]
  };
  var ModuleCalls_instance = null;
  function ModuleCalls_getInstance() {
    if (ModuleCalls_instance === null) {
      new ModuleCalls();
    }return ModuleCalls_instance;
  }
  function ModulesPath() {
    ModulesPath_instance = this;
  }
  ModulesPath.prototype.predicate = function () {
    return 'modulesPath';
  };
  ModulesPath.prototype.default = function () {
    return 'none';
  };
  ModulesPath.prototype.values = function () {
    return Unit;
  };
  ModulesPath.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ModulesPath',
    interfaces: [ArgsFlag]
  };
  var ModulesPath_instance = null;
  function ModulesPath_getInstance() {
    if (ModulesPath_instance === null) {
      new ModulesPath();
    }return ModulesPath_instance;
  }
  function ModuleCall() {
    ModuleCall_instance = this;
    this.signature = new Signature('call_module', 2);
  }
  function ModuleCall$solve$lambda$lambda(closure$request) {
    return function (it) {
      if (Kotlin.isType(it, Solution$Yes))
        return closure$request.replySuccess(it.substitution, void 0, []);
      else
        return closure$request.replyFail(void 0, []);
    };
  }
  function Coroutine$ModuleCall$solve$lambda(closure$solver_0, closure$goal_0, closure$request_0, $receiver_0, controller, continuation_0) {
    CoroutineImpl.call(this, continuation_0);
    this.$controller = controller;
    this.exceptionState_0 = 1;
    this.local$closure$solver = closure$solver_0;
    this.local$closure$goal = closure$goal_0;
    this.local$closure$request = closure$request_0;
    this.local$$receiver = $receiver_0;
  }
  Coroutine$ModuleCall$solve$lambda.$metadata$ = {
    kind: Kotlin.Kind.CLASS,
    simpleName: null,
    interfaces: [CoroutineImpl]
  };
  Coroutine$ModuleCall$solve$lambda.prototype = Object.create(CoroutineImpl.prototype);
  Coroutine$ModuleCall$solve$lambda.prototype.constructor = Coroutine$ModuleCall$solve$lambda;
  Coroutine$ModuleCall$solve$lambda.prototype.doResume = function () {
    do
      try {
        switch (this.state_0) {
          case 0:
            this.state_0 = 2;
            this.result_0 = this.local$$receiver.yieldAll_swo9gw$(map(this.local$closure$solver.solve(this.local$closure$goal), ModuleCall$solve$lambda$lambda(this.local$closure$request)), this);
            if (this.result_0 === COROUTINE_SUSPENDED)
              return COROUTINE_SUSPENDED;
            continue;
          case 1:
            throw this.exception_0;
          case 2:
            return this.result_0;
          default:this.state_0 = 1;
            throw new Error('State Machine Unreachable execution');
        }
      } catch (e) {
        if (this.state_0 === 1) {
          this.exceptionState_0 = this.state_0;
          throw e;
        } else {
          this.state_0 = this.exceptionState_0;
          this.exception_0 = e;
        }
      }
     while (true);
  };
  function ModuleCall$solve$lambda(closure$solver_0, closure$goal_0, closure$request_0) {
    return function ($receiver_0, continuation_0, suspended) {
      var instance = new Coroutine$ModuleCall$solve$lambda(closure$solver_0, closure$goal_0, closure$request_0, $receiver_0, this, continuation_0);
      if (suspended)
        return instance;
      else
        return instance.doResume(null);
    };
  }
  ModuleCall.prototype.solve = function (request) {
    var modules = request.arguments.get_za3lpa$(0);
    var goal = request.arguments.get_za3lpa$(1);
    if (!Kotlin.isType(modules, List)) {
      throw TypeError.Companion.forGoal(request.context, request.signature, TypeError$Expected.LIST, modules);
    }if (!Kotlin.isType(goal, Struct)) {
      throw TypeError.Companion.forGoal(request.context, request.signature, TypeError$Expected.CALLABLE, goal);
    }var tmp$ = request.context;
    var tmp$_0 = this.mineModulesPath_0(request.context);
    var $receiver = modules.toList();
    var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
    var tmp$_1;
    tmp$_1 = $receiver.iterator();
    while (tmp$_1.hasNext()) {
      var item = tmp$_1.next();
      destination.add_11rb$(item.toString());
    }
    var solver = this.getCleanSolver_0(tmp$, tmp$_0, destination);
    return sequence(ModuleCall$solve$lambda(solver, goal, request));
  };
  function ModuleCall$mineModulesPath$lambda$lambda(this$) {
    return function (it) {
      return Kotlin.isType(it, Solution$Yes) ? toString(it.substitution.get_11rb$(this$.X)) : '';
    };
  }
  function ModuleCall$mineModulesPath$lambda(closure$context) {
    return function ($receiver) {
      return first(map(classic_0(Solver.Companion, closure$context.libraries).solve($receiver.stringInvoke('modulesPath', $receiver.X, [])), ModuleCall$mineModulesPath$lambda$lambda($receiver)));
    };
  }
  ModuleCall.prototype.mineModulesPath_0 = function (context) {
    return prolog_0(ModuleCall$mineModulesPath$lambda(context));
  };
  function ModuleCall$getCleanSolver$lambda(closure$modulesPath) {
    return function (mod) {
      return contains(mod, '.pl') ? mod : removeSurrounding(closure$modulesPath, "'") + '/' + mod + '.pl';
    };
  }
  function ModuleCall$getCleanSolver$lambda_0(closure$context, closure$modules, closure$module) {
    return function ($receiver) {
      var $receiver_0 = classic_0(Solver.Companion, closure$context.libraries);
      var closure$modules_0 = closure$modules;
      var closure$module_0 = closure$module;
      var tmp$;
      tmp$ = closure$modules_0.iterator();
      while (tmp$.hasNext()) {
        var element = tmp$.next();
        toList($receiver_0.solve($receiver.stringInvoke('consult', closure$module_0(element), [])));
      }
      return $receiver_0;
    };
  }
  ModuleCall.prototype.getCleanSolver_0 = function (context, modulesPath, modules) {
    var module_0 = ModuleCall$getCleanSolver$lambda(modulesPath);
    return prolog_0(ModuleCall$getCleanSolver$lambda_0(context, modules, module_0));
  };
  ModuleCall.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ModuleCall',
    interfaces: [Primitive]
  };
  var ModuleCall_instance = null;
  function ModuleCall_getInstance() {
    if (ModuleCall_instance === null) {
      new ModuleCall();
    }return ModuleCall_instance;
  }
  function AbstractModeBase() {
    LazyRawPrologContent.call(this);
    this.alias_20vdh5$_0 = 'prolog.argumentation.abstract';
  }
  Object.defineProperty(AbstractModeBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_20vdh5$_0;
    }
  });
  Object.defineProperty(AbstractModeBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(AbstractModeBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return listOf_0([GraphExtension_getInstance(), ArgumentLabellingMode_getInstance(), StatementLabellingMode_getInstance(), GraphBuildMode_getInstance()]);
    }
  });
  AbstractModeBase.prototype.identifier = function () {
    return 'abstract';
  };
  AbstractModeBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'AbstractModeBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function GraphExtension() {
    GraphExtension_instance = this;
  }
  GraphExtension.prototype.predicate = function () {
    return 'graphExtension';
  };
  GraphExtension.prototype.default = function () {
    return listOf('standardPref');
  };
  GraphExtension.prototype.values = function () {
    return listOf_0(['rebutRestriction', 'bp', 'standardPref', 'defeasiblePref', 'defeasibleAllPref']);
  };
  GraphExtension.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'GraphExtension',
    interfaces: [ArgsFlag]
  };
  var GraphExtension_instance = null;
  function GraphExtension_getInstance() {
    if (GraphExtension_instance === null) {
      new GraphExtension();
    }return GraphExtension_instance;
  }
  function ArgumentLabellingMode() {
    ArgumentLabellingMode_instance = this;
  }
  ArgumentLabellingMode.prototype.predicate = function () {
    return 'argumentLabellingMode';
  };
  ArgumentLabellingMode.prototype.default = function () {
    return 'grounded';
  };
  ArgumentLabellingMode.prototype.values = function () {
    return listOf_0(['grounded', 'complete', 'bp_grounded', 'bp_grounded_partial', 'bp_grounded_complete']);
  };
  ArgumentLabellingMode.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ArgumentLabellingMode',
    interfaces: [ArgsFlag]
  };
  var ArgumentLabellingMode_instance = null;
  function ArgumentLabellingMode_getInstance() {
    if (ArgumentLabellingMode_instance === null) {
      new ArgumentLabellingMode();
    }return ArgumentLabellingMode_instance;
  }
  function StatementLabellingMode() {
    StatementLabellingMode_instance = this;
  }
  StatementLabellingMode.prototype.predicate = function () {
    return 'statementLabellingMode';
  };
  StatementLabellingMode.prototype.default = function () {
    return 'statement';
  };
  StatementLabellingMode.prototype.values = function () {
    return listOf('statement');
  };
  StatementLabellingMode.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'StatementLabellingMode',
    interfaces: [ArgsFlag]
  };
  var StatementLabellingMode_instance = null;
  function StatementLabellingMode_getInstance() {
    if (StatementLabellingMode_instance === null) {
      new StatementLabellingMode();
    }return StatementLabellingMode_instance;
  }
  function GraphBuildMode() {
    GraphBuildMode_instance = this;
  }
  GraphBuildMode.prototype.predicate = function () {
    return 'graphBuildMode';
  };
  GraphBuildMode.prototype.default = function () {
    return 'standard_af';
  };
  GraphBuildMode.prototype.values = function () {
    return listOf('standard_af');
  };
  GraphBuildMode.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'GraphBuildMode',
    interfaces: [ArgsFlag]
  };
  var GraphBuildMode_instance = null;
  function GraphBuildMode_getInstance() {
    if (GraphBuildMode_instance === null) {
      new GraphBuildMode();
    }return GraphBuildMode_instance;
  }
  function ArgumentationGraphBuilderBase() {
    LazyRawPrologContent.call(this);
    this.alias_97o1eq$_0 = 'prolog.argumentation.graph';
  }
  Object.defineProperty(ArgumentationGraphBuilderBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_97o1eq$_0;
    }
  });
  Object.defineProperty(ArgumentationGraphBuilderBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(ArgumentationGraphBuilderBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  ArgumentationGraphBuilderBase.prototype.identifier = function () {
    return 'standard_af';
  };
  ArgumentationGraphBuilderBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'ArgumentationGraphBuilderBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function AttackRestrictionHandlerBase() {
    LazyRawPrologContent.call(this);
    this.alias_adfudl$_0 = 'prolog.argumentation.graph.rebutrestriction';
  }
  Object.defineProperty(AttackRestrictionHandlerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_adfudl$_0;
    }
  });
  Object.defineProperty(AttackRestrictionHandlerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(AttackRestrictionHandlerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  AttackRestrictionHandlerBase.prototype.identifier = function () {
    return 'rebutRestriction';
  };
  AttackRestrictionHandlerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'AttackRestrictionHandlerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function BpMetaGraphHandlerBase() {
    LazyRawPrologContent.call(this);
    this.alias_vy9s00$_0 = 'prolog.argumentation.graph.meta.bp';
  }
  Object.defineProperty(BpMetaGraphHandlerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_vy9s00$_0;
    }
  });
  Object.defineProperty(BpMetaGraphHandlerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(BpMetaGraphHandlerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  BpMetaGraphHandlerBase.prototype.identifier = function () {
    return 'bp';
  };
  BpMetaGraphHandlerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'BpMetaGraphHandlerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function DefeasiblePreferencesHandlerBase() {
    LazyRawPrologContent.call(this);
    this.alias_4iduyv$_0 = 'prolog.argumentation.graph.preferences.defeasible';
  }
  Object.defineProperty(DefeasiblePreferencesHandlerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_4iduyv$_0;
    }
  });
  Object.defineProperty(DefeasiblePreferencesHandlerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(DefeasiblePreferencesHandlerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  DefeasiblePreferencesHandlerBase.prototype.identifier = function () {
    return 'defeasiblePref';
  };
  DefeasiblePreferencesHandlerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DefeasiblePreferencesHandlerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function GenericDefeasiblePreferencesHandlerBase() {
    LazyRawPrologContent.call(this);
    this.alias_h4h2we$_0 = 'prolog.argumentation.graph.preferences.defeasible.generic';
  }
  Object.defineProperty(GenericDefeasiblePreferencesHandlerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_h4h2we$_0;
    }
  });
  Object.defineProperty(GenericDefeasiblePreferencesHandlerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(GenericDefeasiblePreferencesHandlerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  GenericDefeasiblePreferencesHandlerBase.prototype.identifier = function () {
    return 'defeasibleAllPref';
  };
  GenericDefeasiblePreferencesHandlerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'GenericDefeasiblePreferencesHandlerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function StrictPreferencesHandlerBase() {
    LazyRawPrologContent.call(this);
    this.alias_t055po$_0 = 'prolog.argumentation.graph.preferences.strict';
  }
  Object.defineProperty(StrictPreferencesHandlerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_t055po$_0;
    }
  });
  Object.defineProperty(StrictPreferencesHandlerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(StrictPreferencesHandlerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  StrictPreferencesHandlerBase.prototype.identifier = function () {
    return 'standardPref';
  };
  StrictPreferencesHandlerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StrictPreferencesHandlerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function BpCompleteLabellerBase() {
    LazyRawPrologContent.call(this);
    this.alias_ct2pe$_0 = 'prolog.argumentation.graph.labelling.bpgroundedcomplete';
  }
  Object.defineProperty(BpCompleteLabellerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_ct2pe$_0;
    }
  });
  Object.defineProperty(BpCompleteLabellerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(BpCompleteLabellerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  BpCompleteLabellerBase.prototype.identifier = function () {
    return 'bp_grounded_complete';
  };
  BpCompleteLabellerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'BpCompleteLabellerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function BpLabellerBase() {
    LazyRawPrologContent.call(this);
    this.alias_bxcq2h$_0 = 'prolog.argumentation.graph.labelling.bpgrounded';
  }
  Object.defineProperty(BpLabellerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_bxcq2h$_0;
    }
  });
  Object.defineProperty(BpLabellerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(BpLabellerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  BpLabellerBase.prototype.identifier = function () {
    return 'bp_grounded';
  };
  BpLabellerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'BpLabellerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function BpPartialLabellerBase() {
    LazyRawPrologContent.call(this);
    this.alias_p5bkbg$_0 = 'prolog.argumentation.graph.labelling.bpgroundedpartial';
  }
  Object.defineProperty(BpPartialLabellerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_p5bkbg$_0;
    }
  });
  Object.defineProperty(BpPartialLabellerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(BpPartialLabellerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  BpPartialLabellerBase.prototype.identifier = function () {
    return 'bp_grounded_partial';
  };
  BpPartialLabellerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'BpPartialLabellerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function CompleteLabellerBase() {
    LazyRawPrologContent.call(this);
    this.alias_qi88w4$_0 = 'prolog.argumentation.graph.labelling.complete';
  }
  Object.defineProperty(CompleteLabellerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_qi88w4$_0;
    }
  });
  Object.defineProperty(CompleteLabellerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(CompleteLabellerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  CompleteLabellerBase.prototype.identifier = function () {
    return 'complete';
  };
  CompleteLabellerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'CompleteLabellerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function GroundedLabellerBase() {
    LazyRawPrologContent.call(this);
    this.alias_6e4o5t$_0 = 'prolog.argumentation.graph.labelling.grounded';
  }
  Object.defineProperty(GroundedLabellerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_6e4o5t$_0;
    }
  });
  Object.defineProperty(GroundedLabellerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(GroundedLabellerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  GroundedLabellerBase.prototype.identifier = function () {
    return 'grounded';
  };
  GroundedLabellerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'GroundedLabellerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function StatementLabellerBase() {
    LazyRawPrologContent.call(this);
    this.alias_8wmdq8$_0 = 'prolog.argumentation.graph.labelling.statement';
  }
  Object.defineProperty(StatementLabellerBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_8wmdq8$_0;
    }
  });
  Object.defineProperty(StatementLabellerBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(StatementLabellerBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  StatementLabellerBase.prototype.identifier = function () {
    return 'statement';
  };
  StatementLabellerBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StatementLabellerBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function RuleParserBase() {
    LazyRawPrologContent.call(this);
    this.alias_ax3va9$_0 = 'prolog.argumentation.parser';
  }
  Object.defineProperty(RuleParserBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_ax3va9$_0;
    }
  });
  Object.defineProperty(RuleParserBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, mapOf_0([getPropertyCallableRef('descriptionPair', 0, function ($receiver) {
        return $receiver.descriptionPair;
      }.bind(null, StrictRules_getInstance())).get(), getPropertyCallableRef('descriptionPair', 0, function ($receiver) {
        return $receiver.descriptionPair;
      }.bind(null, Axioms_getInstance())).get(), getPropertyCallableRef('descriptionPair', 0, function ($receiver) {
        return $receiver.descriptionPair;
      }.bind(null, Bps_getInstance())).get(), getPropertyCallableRef('descriptionPair', 0, function ($receiver) {
        return $receiver.descriptionPair;
      }.bind(null, Premises_getInstance())).get(), getPropertyCallableRef('descriptionPair', 0, function ($receiver) {
        return $receiver.descriptionPair;
      }.bind(null, DefeasibleRules_getInstance())).get()]), this.prologTheory);
    }
  });
  Object.defineProperty(RuleParserBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return listOf_0([AutoTransposition_getInstance(), PrologStrictCompatibility_getInstance()]);
    }
  });
  RuleParserBase.prototype.identifier = function () {
    return 'parser';
  };
  RuleParserBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'RuleParserBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function AutoTransposition() {
    AutoTransposition_instance = this;
  }
  AutoTransposition.prototype.predicate = function () {
    return 'autoTransposition';
  };
  AutoTransposition.prototype.default = function () {
    return false;
  };
  AutoTransposition.prototype.values = function () {
    return Unit;
  };
  AutoTransposition.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'AutoTransposition',
    interfaces: [ArgsFlag]
  };
  var AutoTransposition_instance = null;
  function AutoTransposition_getInstance() {
    if (AutoTransposition_instance === null) {
      new AutoTransposition();
    }return AutoTransposition_instance;
  }
  function PrologStrictCompatibility() {
    PrologStrictCompatibility_instance = this;
  }
  PrologStrictCompatibility.prototype.predicate = function () {
    return 'prologStrictCompatibility';
  };
  PrologStrictCompatibility.prototype.default = function () {
    return true;
  };
  PrologStrictCompatibility.prototype.values = function () {
    return Unit;
  };
  PrologStrictCompatibility.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'PrologStrictCompatibility',
    interfaces: [ArgsFlag]
  };
  var PrologStrictCompatibility_instance = null;
  function PrologStrictCompatibility_getInstance() {
    if (PrologStrictCompatibility_instance === null) {
      new PrologStrictCompatibility();
    }return PrologStrictCompatibility_instance;
  }
  function ConversionUtils() {
    ConversionUtils_instance = this;
  }
  function ConversionUtils$modifiers$lambda(closure$target, closure$context) {
    return function ($receiver) {
      var $receiver_0 = closure$target.bodyItems;
      var destination = ArrayList_init(collectionSizeOrDefault($receiver_0, 10));
      var tmp$;
      tmp$ = $receiver_0.iterator();
      while (tmp$.hasNext()) {
        var item = tmp$.next();
        var tmp$_0 = destination.add_11rb$;
        var closure$context_0 = closure$context;
        var tmp$_1;
        tmp$_0.call(destination, item.isStruct && equals((tmp$_1 = item.asStruct()) != null ? tmp$_1.functor : null, '\\+') ? $receiver.stringInvoke('~', ensureNotNull(item.asStruct()).argsList.get_za3lpa$(0), []) : first(closure$context_0.solve($receiver.stringInvoke('clause', item, [Var.Companion.ANONYMOUS_NAME]))).isHalt ? $receiver.stringInvoke('prolog', item, []) : item);
      }
      return destination.size > 1 ? $receiver.tupleOfIterable(destination) : first_0(destination);
    };
  }
  ConversionUtils.prototype.modifiers_3bh3rj$ = function (target, context) {
    return prolog_0(ConversionUtils$modifiers$lambda(target, context));
  };
  function ConversionUtils$commonMap$lambda(closure$first, closure$force, closure$context, closure$mapper) {
    return function ($receiver) {
      var tmp$, tmp$_0, tmp$_1;
      tmp$_1 = Substitution.Companion;
      tmp$ = closure$first.castToVar();
      if (closure$force || first(closure$context.solve(parse_1(Struct.Companion, 'prologStrictCompatibility'))).isYes) {
        tmp$_0 = closure$mapper(closure$context.context.staticKb.clauses, $receiver);
      } else {
        tmp$_0 = $receiver.emptyList;
      }
      return sequenceOf([tmp$_1.of(tmp$, tmp$_0)]);
    };
  }
  ConversionUtils.prototype.commonMap_sg2xgv$ = function (context, first, force, mapper) {
    if (force === void 0)
      force = false;
    PrimitiveWrapper.Companion.ensuringArgumentIsVariable_3adri$(context, 0);
    return prolog_0(ConversionUtils$commonMap$lambda(first, force, context, mapper));
  };
  ConversionUtils.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ConversionUtils',
    interfaces: []
  };
  var ConversionUtils_instance = null;
  function ConversionUtils_getInstance() {
    if (ConversionUtils_instance === null) {
      new ConversionUtils();
    }return ConversionUtils_instance;
  }
  function StrictRules() {
    StrictRules_instance = this;
    UnaryPredicate$WithoutSideEffects.call(this, 'prologStrictRules');
  }
  function StrictRules$computeAllSubstitutions$lambda(this$computeAllSubstitutions) {
    return function (clauses, prologScope) {
      var destination = ArrayList_init_0();
      var tmp$;
      tmp$ = clauses.iterator();
      while (tmp$.hasNext()) {
        var element = tmp$.next();
        if (!element.isFact)
          destination.add_11rb$(element);
      }
      var destination_0 = ArrayList_init(collectionSizeOrDefault(destination, 10));
      var tmp$_0;
      tmp$_0 = destination.iterator();
      while (tmp$_0.hasNext()) {
        var item = tmp$_0.next();
        var tmp$_1 = destination_0.add_11rb$;
        var this$computeAllSubstitutions_0 = this$computeAllSubstitutions;
        tmp$_1.call(destination_0, prologScope.listOfAny(['rule_' + Random.Default.nextInt_vux9f0$(0, 2147483647), ConversionUtils_getInstance().modifiers_3bh3rj$(item, this$computeAllSubstitutions_0), ensureNotNull(item.head)]));
      }
      return toTerm(destination_0);
    };
  }
  StrictRules.prototype.computeAllSubstitutions_jktvg7$ = function ($receiver, first) {
    return ConversionUtils_getInstance().commonMap_sg2xgv$($receiver, first, void 0, StrictRules$computeAllSubstitutions$lambda($receiver));
  };
  StrictRules.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'StrictRules',
    interfaces: [UnaryPredicate$WithoutSideEffects]
  };
  var StrictRules_instance = null;
  function StrictRules_getInstance() {
    if (StrictRules_instance === null) {
      new StrictRules();
    }return StrictRules_instance;
  }
  function Axioms() {
    Axioms_instance = this;
    UnaryPredicate$WithoutSideEffects.call(this, 'prologAxioms');
  }
  function Axioms$computeAllSubstitutions$lambda(clauses, prologScope) {
    var destination = ArrayList_init_0();
    var tmp$;
    tmp$ = clauses.iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      if (element.isFact && !listOf_0([':->', '->', '=>', ':=>', ':', ':=', ',']).contains_11rb$(ensureNotNull(element.head).functor))
        destination.add_11rb$(element);
    }
    var destination_0 = ArrayList_init(collectionSizeOrDefault(destination, 10));
    var tmp$_0;
    tmp$_0 = destination.iterator();
    while (tmp$_0.hasNext()) {
      var item = tmp$_0.next();
      destination_0.add_11rb$(prologScope.listOfAny(['rule_' + Random.Default.nextInt_vux9f0$(0, 2147483647), ensureNotNull(item.head)]));
    }
    return toTerm(destination_0);
  }
  Axioms.prototype.computeAllSubstitutions_jktvg7$ = function ($receiver, first) {
    return ConversionUtils_getInstance().commonMap_sg2xgv$($receiver, first, void 0, Axioms$computeAllSubstitutions$lambda);
  };
  Axioms.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Axioms',
    interfaces: [UnaryPredicate$WithoutSideEffects]
  };
  var Axioms_instance = null;
  function Axioms_getInstance() {
    if (Axioms_instance === null) {
      new Axioms();
    }return Axioms_instance;
  }
  function Premises() {
    Premises_instance = this;
    UnaryPredicate$WithoutSideEffects.call(this, 'prologPremises');
  }
  function Premises$computeAllSubstitutions$lambda(clauses, prologScope) {
    var destination = ArrayList_init_0();
    var tmp$;
    tmp$ = clauses.iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      if (element.isFact && equals(ensureNotNull(element.head).functor, ':=') && ensureNotNull(element.head).arity === 1)
        destination.add_11rb$(element);
    }
    var destination_0 = ArrayList_init(collectionSizeOrDefault(destination, 10));
    var tmp$_0;
    tmp$_0 = destination.iterator();
    while (tmp$_0.hasNext()) {
      var item = tmp$_0.next();
      destination_0.add_11rb$(prologScope.listOfAny(['rule_' + Random.Default.nextInt_vux9f0$(0, 2147483647), ensureNotNull(item.head).argsList.get_za3lpa$(0)]));
    }
    return toTerm(destination_0);
  }
  Premises.prototype.computeAllSubstitutions_jktvg7$ = function ($receiver, first) {
    return ConversionUtils_getInstance().commonMap_sg2xgv$($receiver, first, void 0, Premises$computeAllSubstitutions$lambda);
  };
  Premises.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Premises',
    interfaces: [UnaryPredicate$WithoutSideEffects]
  };
  var Premises_instance = null;
  function Premises_getInstance() {
    if (Premises_instance === null) {
      new Premises();
    }return Premises_instance;
  }
  function DefeasibleRules() {
    DefeasibleRules_instance = this;
    UnaryPredicate$WithoutSideEffects.call(this, 'prologDefeasibleRules');
  }
  function DefeasibleRules$computeAllSubstitutions$lambda(this$computeAllSubstitutions) {
    return function (clauses, prologScope) {
      var destination = ArrayList_init_0();
      var tmp$;
      tmp$ = clauses.iterator();
      while (tmp$.hasNext()) {
        var element = tmp$.next();
        var tmp$_0;
        if (element.isFact && (equals(ensureNotNull(element.head).functor, ':=') || (equals(ensureNotNull(element.head).functor, ',') && equals((tmp$_0 = ensureNotNull(element.head).argsList.get_za3lpa$(0).asStruct()) != null ? tmp$_0.functor : null, ':='))) && ensureNotNull(element.head).arity === 2)
          destination.add_11rb$(element);
      }
      var destination_0 = ArrayList_init(collectionSizeOrDefault(destination, 10));
      var tmp$_1;
      tmp$_1 = destination.iterator();
      while (tmp$_1.hasNext()) {
        var item = tmp$_1.next();
        var tmp$_2 = destination_0.add_11rb$;
        var this$computeAllSubstitutions_0 = this$computeAllSubstitutions;
        var tmp$_3, tmp$_4, tmp$_5;
        if (equals(ensureNotNull(item.head).functor, ',')) {
          var head = ensureNotNull(item.head).argsList.get_za3lpa$(0).asStruct();
          var term = copyToArray(plus(listOf(ensureNotNull(head).get(1)), (tmp$_4 = (tmp$_3 = ensureNotNull(item.head).argsList.get_za3lpa$(1).asTuple()) != null ? tmp$_3.argsList : null) != null ? tmp$_4 : listOf(ensureNotNull(item.head).argsList.get_za3lpa$(1))));
          tmp$_5 = prologScope.clauseOf(head.get(0).asStruct(), term.slice());
        } else {
          tmp$_5 = prologScope.clauseOf(ensureNotNull(item.head).argsList.get_za3lpa$(0).asStruct(), [ensureNotNull(item.head).argsList.get_za3lpa$(1)]);
        }
        var $receiver = tmp$_5;
        tmp$_2.call(destination_0, prologScope.listOfAny(['rule_' + Random.Default.nextInt_vux9f0$(0, 2147483647), ConversionUtils_getInstance().modifiers_3bh3rj$($receiver, this$computeAllSubstitutions_0), ensureNotNull($receiver.head)]));
      }
      return toTerm(destination_0);
    };
  }
  DefeasibleRules.prototype.computeAllSubstitutions_jktvg7$ = function ($receiver, first) {
    return ConversionUtils_getInstance().commonMap_sg2xgv$($receiver, first, void 0, DefeasibleRules$computeAllSubstitutions$lambda($receiver));
  };
  DefeasibleRules.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'DefeasibleRules',
    interfaces: [UnaryPredicate$WithoutSideEffects]
  };
  var DefeasibleRules_instance = null;
  function DefeasibleRules_getInstance() {
    if (DefeasibleRules_instance === null) {
      new DefeasibleRules();
    }return DefeasibleRules_instance;
  }
  function Bps() {
    Bps_instance = this;
    UnaryPredicate$WithoutSideEffects.call(this, 'bpsNew');
  }
  function Bps$computeAllSubstitutions$lambda(clauses, prologScope) {
    var destination = ArrayList_init_0();
    var tmp$;
    tmp$ = clauses.iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      var tmp$_0;
      if (element.isFact && equals((tmp$_0 = element.head) != null ? tmp$_0.functor : null, 'bp'))
        destination.add_11rb$(element);
    }
    var destination_0 = ArrayList_init(collectionSizeOrDefault(destination, 10));
    var tmp$_1;
    tmp$_1 = destination.iterator();
    while (tmp$_1.hasNext()) {
      var item = tmp$_1.next();
      destination_0.add_11rb$(prologScope.listOfAny(['bps', ensureNotNull(item.head)]));
    }
    return toTerm(destination_0);
  }
  Bps.prototype.computeAllSubstitutions_jktvg7$ = function ($receiver, first) {
    return ConversionUtils_getInstance().commonMap_sg2xgv$($receiver, first, true, Bps$computeAllSubstitutions$lambda);
  };
  Bps.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Bps',
    interfaces: [UnaryPredicate$WithoutSideEffects]
  };
  var Bps_instance = null;
  function Bps_getInstance() {
    if (Bps_instance === null) {
      new Bps();
    }return Bps_instance;
  }
  function StructuredModeBase() {
    LazyRawPrologContent.call(this);
    this.alias_k0m5up$_0 = 'prolog.argumentation.structured';
  }
  Object.defineProperty(StructuredModeBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_k0m5up$_0;
    }
  });
  Object.defineProperty(StructuredModeBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(StructuredModeBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return listOf(QueryMode_getInstance());
    }
  });
  StructuredModeBase.prototype.identifier = function () {
    return 'structured';
  };
  StructuredModeBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'StructuredModeBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function QueryMode() {
    QueryMode_instance = this;
  }
  QueryMode.prototype.predicate = function () {
    return 'queryMode';
  };
  QueryMode.prototype.default = function () {
    return true;
  };
  QueryMode.prototype.values = function () {
    return Unit;
  };
  QueryMode.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'QueryMode',
    interfaces: [ArgsFlag]
  };
  var QueryMode_instance = null;
  function QueryMode_getInstance() {
    if (QueryMode_instance === null) {
      new QueryMode();
    }return QueryMode_instance;
  }
  function DebugBase() {
    LazyRawPrologContent.call(this);
    this.alias_kdrkna$_0 = 'prolog.argumentation.debug';
  }
  Object.defineProperty(DebugBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_kdrkna$_0;
    }
  });
  Object.defineProperty(DebugBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(DebugBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  DebugBase.prototype.identifier = function () {
    return 'debug';
  };
  DebugBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'DebugBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function SuperiorityRelationBase() {
    LazyRawPrologContent.call(this);
    this.alias_cczqdw$_0 = 'prolog.argumentation.superiority';
  }
  Object.defineProperty(SuperiorityRelationBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_cczqdw$_0;
    }
  });
  Object.defineProperty(SuperiorityRelationBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(SuperiorityRelationBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return listOf_0([OrderingPrinciple_getInstance(), OrderingComparator_getInstance()]);
    }
  });
  SuperiorityRelationBase.prototype.identifier = function () {
    return 'superiority';
  };
  SuperiorityRelationBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'SuperiorityRelationBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function OrderingPrinciple() {
    OrderingPrinciple_instance = this;
  }
  OrderingPrinciple.prototype.predicate = function () {
    return 'orderingPrinciple';
  };
  OrderingPrinciple.prototype.default = function () {
    return 'last';
  };
  OrderingPrinciple.prototype.values = function () {
    return listOf_0(['last', 'weakest']);
  };
  OrderingPrinciple.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'OrderingPrinciple',
    interfaces: [ArgsFlag]
  };
  var OrderingPrinciple_instance = null;
  function OrderingPrinciple_getInstance() {
    if (OrderingPrinciple_instance === null) {
      new OrderingPrinciple();
    }return OrderingPrinciple_instance;
  }
  function OrderingComparator() {
    OrderingComparator_instance = this;
  }
  OrderingComparator.prototype.predicate = function () {
    return 'orderingComparator';
  };
  OrderingComparator.prototype.default = function () {
    return 'elitist';
  };
  OrderingComparator.prototype.values = function () {
    return listOf_0(['elitist', 'democrat', 'normal']);
  };
  OrderingComparator.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'OrderingComparator',
    interfaces: [ArgsFlag]
  };
  var OrderingComparator_instance = null;
  function OrderingComparator_getInstance() {
    if (OrderingComparator_instance === null) {
      new OrderingComparator();
    }return OrderingComparator_instance;
  }
  function UtilsBase() {
    LazyRawPrologContent.call(this);
    this.alias_7qdeho$_0 = 'prolog.argumentation.utils';
  }
  Object.defineProperty(UtilsBase.prototype, 'alias', {
    configurable: true,
    get: function () {
      return this.alias_7qdeho$_0;
    }
  });
  Object.defineProperty(UtilsBase.prototype, 'baseContent', {
    configurable: true,
    get: function () {
      return Library.Companion.aliased(this.alias, void 0, this.prologTheory);
    }
  });
  Object.defineProperty(UtilsBase.prototype, 'baseFlags', {
    configurable: true,
    get: function () {
      return emptyList();
    }
  });
  UtilsBase.prototype.identifier = function () {
    return 'utils';
  };
  UtilsBase.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'UtilsBase',
    interfaces: [Loadable, LazyRawPrologContent, ArgLibrary]
  };
  function graph($receiver, context) {
    var it = arguments_0($receiver, context);
    return Graph$Companion_getInstance().of_mf1h1a$(labels($receiver, context, it), attacks($receiver, context, it), supports($receiver, context, it));
  }
  function arguments$lambda$lambda(it) {
    return it.isYes;
  }
  function arguments$lambda$lambda_0(this$) {
    return function (it) {
      return ensureNotNull(it.substitution.get_11rb$(this$.X));
    };
  }
  function arguments$lambda$lambda_1(solution) {
    return Argument$Companion_getInstance().of_z0t4vt$(solution);
  }
  function arguments$lambda$lambda_2(it) {
    return it.supports.size;
  }
  function arguments$lambda$lambda_3(it) {
    return it.rules.size;
  }
  function arguments$lambda$lambda_4(it) {
    return it.conclusion;
  }
  function arguments$lambda$lambda_5(it) {
    return it.topRule;
  }
  function arguments$lambda$lambda_6(index, arg) {
    arg.identifier = 'A' + index;
    return arg;
  }
  function arguments$lambda(this$arguments, closure$context) {
    return function ($receiver) {
      return mapIndexed(sortedWith(map(map(filter(this$arguments.solve($receiver.stringInvoke('context_check', closure$context, [$receiver.stringInvoke('argument', $receiver.X, [])])), arguments$lambda$lambda), arguments$lambda$lambda_0($receiver)), arguments$lambda$lambda_1), compareBy([arguments$lambda$lambda_2, arguments$lambda$lambda_3, arguments$lambda$lambda_4, arguments$lambda$lambda_5])), arguments$lambda$lambda_6);
    };
  }
  function arguments_0($receiver, context) {
    return toList(prolog(arguments$lambda($receiver, context)));
  }
  function attacks$lambda$lambda(it) {
    return it.isYes;
  }
  function attacks$lambda$lambda_0(closure$arguments, this$) {
    return function (solution) {
      var $receiver = closure$arguments;
      var first$result;
      first$break: do {
        var tmp$;
        tmp$ = $receiver.iterator();
        while (tmp$.hasNext()) {
          var element = tmp$.next();
          var this$_0 = this$;
          if (Unificator.Companion.default.match(element.termRepresentation(), ensureNotNull(solution.substitution.get_11rb$(this$_0.X)))) {
            first$result = element;
            break first$break;
          }}
        throw new NoSuchElementException_init('Collection contains no element matching the predicate.');
      }
       while (false);
      var tmp$_0 = first$result;
      var $receiver_0 = closure$arguments;
      var first$result_0;
      first$break: do {
        var tmp$_1;
        tmp$_1 = $receiver_0.iterator();
        while (tmp$_1.hasNext()) {
          var element_0 = tmp$_1.next();
          var this$_1 = this$;
          if (Unificator.Companion.default.match(element_0.termRepresentation(), ensureNotNull(solution.substitution.get_11rb$(this$_1.Y)))) {
            first$result_0 = element_0;
            break first$break;
          }}
        throw new NoSuchElementException_init('Collection contains no element matching the predicate.');
      }
       while (false);
      return new Attack(tmp$_0, first$result_0);
    };
  }
  function attacks$lambda(this$attacks, closure$context, closure$arguments) {
    return function ($receiver) {
      return map(filter(this$attacks.solve($receiver.stringInvoke('context_check', closure$context, [$receiver.stringInvoke('attack', $receiver._, [$receiver.X, $receiver.Y, $receiver._])])), attacks$lambda$lambda), attacks$lambda$lambda_0(closure$arguments, $receiver));
    };
  }
  function attacks($receiver, context, arguments_0) {
    if (arguments_0.isEmpty())
      return emptyList();
    return toList(prolog(attacks$lambda($receiver, context, arguments_0)));
  }
  function supports$lambda$lambda$lambda(it) {
    return it.isYes;
  }
  function supports$lambda$lambda$lambda_0(this$) {
    return function (it) {
      return ensureNotNull(it.substitution.get_11rb$(this$.X));
    };
  }
  function supports$lambda$lambda$lambda_1(closure$arguments, closure$argument) {
    return function (solution) {
      var $receiver = closure$arguments;
      var first$result;
      first$break: do {
        var tmp$;
        tmp$ = $receiver.iterator();
        while (tmp$.hasNext()) {
          var element = tmp$.next();
          if (Unificator.Companion.default.match(element.termRepresentation(), solution)) {
            first$result = element;
            break first$break;
          }}
        throw new NoSuchElementException_init('Collection contains no element matching the predicate.');
      }
       while (false);
      var $receiver_0 = new Support(first$result, closure$argument);
      closure$argument.supports.add_11rb$($receiver_0.supporter);
      return $receiver_0;
    };
  }
  function supports$lambda$lambda(this$supports, closure$context, closure$argument, closure$arguments) {
    return function ($receiver) {
      return toList(map(map(filter(this$supports.solve($receiver.stringInvoke('context_check', closure$context, [$receiver.stringInvoke('support', $receiver.X, [closure$argument.termRepresentation()])])), supports$lambda$lambda$lambda), supports$lambda$lambda$lambda_0($receiver)), supports$lambda$lambda$lambda_1(closure$arguments, closure$argument)));
    };
  }
  function supports($receiver, context, arguments_0) {
    var destination = ArrayList_init_0();
    var tmp$;
    tmp$ = arguments_0.iterator();
    while (tmp$.hasNext()) {
      var element = tmp$.next();
      var list = prolog(supports$lambda$lambda($receiver, context, element, arguments_0));
      addAll(destination, list);
    }
    return destination;
  }
  function labels$checkFunctor$lambda$lambda(it) {
    return it.isYes;
  }
  function labels$checkFunctor$lambda$lambda_0(closure$functor) {
    return function (it) {
      return closure$functor;
    };
  }
  function labels$checkFunctor$lambda(this$labels, closure$context, closure$functor, closure$argument) {
    return function ($receiver) {
      return firstOrNull(map(filter(this$labels.solve($receiver.stringInvoke('context_check', closure$context, [$receiver.stringInvoke(closure$functor, closure$argument.termRepresentation(), [])])), labels$checkFunctor$lambda$lambda), labels$checkFunctor$lambda$lambda_0(closure$functor)));
    };
  }
  function labels$checkFunctor(this$labels, closure$context) {
    return function (functor, argument) {
      return prolog(labels$checkFunctor$lambda(this$labels, closure$context, functor, argument));
    };
  }
  function labels($receiver, context, arguments_0) {
    var checkFunctor = labels$checkFunctor($receiver, context);
    var destination = ArrayList_init(collectionSizeOrDefault(arguments_0, 10));
    var tmp$;
    tmp$ = arguments_0.iterator();
    while (tmp$.hasNext()) {
      var item = tmp$.next();
      var tmp$_0, tmp$_1;
      destination.add_11rb$(new LabelledArgument(item, (tmp$_1 = (tmp$_0 = checkFunctor('in', item)) != null ? tmp$_0 : checkFunctor('out', item)) != null ? tmp$_1 : 'und'));
    }
    return destination;
  }
  function Argument(rules, topRule, conclusion, groundings, defeasibleRules, defeasiblePremises, lastDefeasibleRules) {
    Argument$Companion_getInstance();
    if (groundings === void 0)
      groundings = emptyList();
    if (defeasibleRules === void 0)
      defeasibleRules = emptyList();
    if (defeasiblePremises === void 0)
      defeasiblePremises = emptyList();
    if (lastDefeasibleRules === void 0)
      lastDefeasibleRules = emptyList();
    this.rules = rules;
    this.topRule = topRule;
    this.conclusion = conclusion;
    this.groundings = groundings;
    this.defeasibleRules = defeasibleRules;
    this.defeasiblePremises = defeasiblePremises;
    this.lastDefeasibleRules = lastDefeasibleRules;
    this.identifier = '';
    this.supports = ArrayList_init_0();
  }
  Object.defineProperty(Argument.prototype, 'descriptor', {
    configurable: true,
    get: function () {
      var tmp$, tmp$_0, tmp$_1;
      tmp$_1 = this.identifier + ' : ';
      if (equals(this.topRule, 'none'))
        tmp$_0 = (tmp$ = firstOrNull_0(this.rules)) != null ? tmp$ : '';
      else {
        var $receiver = this.supports;
        var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
        var tmp$_2;
        tmp$_2 = $receiver.iterator();
        while (tmp$_2.hasNext()) {
          var item = tmp$_2.next();
          destination.add_11rb$(item.identifier);
        }
        var iterator = plus_0(destination, this.topRule).iterator();
        if (!iterator.hasNext())
          throw UnsupportedOperationException_init("Empty collection can't be reduced.");
        var accumulator = iterator.next();
        while (iterator.hasNext()) {
          accumulator = accumulator + ',' + iterator.next();
        }
        tmp$_0 = accumulator;
      }
      return tmp$_1 + tmp$_0 + ' : ' + this.conclusion;
    }
  });
  Argument.prototype.termRepresentation = function () {
    return parse_1(Struct.Companion, '[' + this.rules + ', ' + this.topRule + ', ' + this.conclusion + ', ' + this.groundings + ', [' + this.lastDefeasibleRules + ', ' + this.defeasibleRules + ', ' + this.defeasiblePremises + ']]');
  };
  Argument.prototype.toString = function () {
    return 'argument(' + this.termRepresentation() + ')';
  };
  Argument.prototype.toTerm = function () {
    return parse_1(Struct.Companion, this.toString());
  };
  function Argument$Companion() {
    Argument$Companion_instance = this;
  }
  function Argument$Companion$of$termAsList(t) {
    var tmp$;
    return (Kotlin.isType(tmp$ = t, Cons) ? tmp$ : throwCCE()).toList();
  }
  function Argument$Companion$of$toStringList(argument, target) {
    var tmp$;
    var $receiver = argument.get_za3lpa$(target).isEmptyList ? emptyList() : (Kotlin.isType(tmp$ = argument.get_za3lpa$(target), Cons) ? tmp$ : throwCCE()).toList();
    var destination = ArrayList_init(collectionSizeOrDefault($receiver, 10));
    var tmp$_0;
    tmp$_0 = $receiver.iterator();
    while (tmp$_0.hasNext()) {
      var item = tmp$_0.next();
      destination.add_11rb$(item.toString());
    }
    return destination;
  }
  function Argument$Companion$of$argRules(closure$toStringList) {
    return function (argument) {
      return closure$toStringList(argument, 0);
    };
  }
  function Argument$Companion$of$argTopRule(argument) {
    return argument.get_za3lpa$(1).toString();
  }
  function Argument$Companion$of$argConclusion(argument) {
    return argument.get_za3lpa$(2).toString();
  }
  function Argument$Companion$of$argGroundings(closure$toStringList) {
    return function (argument) {
      return closure$toStringList(argument, 3);
    };
  }
  function Argument$Companion$of$argDefeasibleRules(closure$termAsList, closure$toStringList) {
    return function (argument) {
      return closure$toStringList(closure$termAsList(argument.get_za3lpa$(4)), 1);
    };
  }
  function Argument$Companion$of$argDefeasiblePremises(closure$termAsList, closure$toStringList) {
    return function (argument) {
      return closure$toStringList(closure$termAsList(argument.get_za3lpa$(4)), 2);
    };
  }
  function Argument$Companion$of$argLastDefeasibleRules(closure$termAsList, closure$toStringList) {
    return function (argument) {
      return closure$toStringList(closure$termAsList(argument.get_za3lpa$(4)), 0);
    };
  }
  Argument$Companion.prototype.of_z0t4vt$ = function (term) {
    var termAsList = Argument$Companion$of$termAsList;
    var toStringList = Argument$Companion$of$toStringList;
    var argRules = Argument$Companion$of$argRules(toStringList);
    var argTopRule = Argument$Companion$of$argTopRule;
    var argConclusion = Argument$Companion$of$argConclusion;
    var argGroundings = Argument$Companion$of$argGroundings(toStringList);
    var argDefeasibleRules = Argument$Companion$of$argDefeasibleRules(termAsList, toStringList);
    var argDefeasiblePremises = Argument$Companion$of$argDefeasiblePremises(termAsList, toStringList);
    var argLastDefeasibleRules = Argument$Companion$of$argLastDefeasibleRules(termAsList, toStringList);
    var it = termAsList(term);
    return new Argument(argRules(it), argTopRule(it), argConclusion(it), argGroundings(it), argDefeasibleRules(it), argDefeasiblePremises(it), argLastDefeasibleRules(it));
  };
  Argument$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var Argument$Companion_instance = null;
  function Argument$Companion_getInstance() {
    if (Argument$Companion_instance === null) {
      new Argument$Companion();
    }return Argument$Companion_instance;
  }
  Argument.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Argument',
    interfaces: []
  };
  Argument.prototype.component1 = function () {
    return this.rules;
  };
  Argument.prototype.component2 = function () {
    return this.topRule;
  };
  Argument.prototype.component3 = function () {
    return this.conclusion;
  };
  Argument.prototype.component4 = function () {
    return this.groundings;
  };
  Argument.prototype.component5 = function () {
    return this.defeasibleRules;
  };
  Argument.prototype.component6 = function () {
    return this.defeasiblePremises;
  };
  Argument.prototype.component7 = function () {
    return this.lastDefeasibleRules;
  };
  Argument.prototype.copy_2b7ur7$ = function (rules, topRule, conclusion, groundings, defeasibleRules, defeasiblePremises, lastDefeasibleRules) {
    return new Argument(rules === void 0 ? this.rules : rules, topRule === void 0 ? this.topRule : topRule, conclusion === void 0 ? this.conclusion : conclusion, groundings === void 0 ? this.groundings : groundings, defeasibleRules === void 0 ? this.defeasibleRules : defeasibleRules, defeasiblePremises === void 0 ? this.defeasiblePremises : defeasiblePremises, lastDefeasibleRules === void 0 ? this.lastDefeasibleRules : lastDefeasibleRules);
  };
  Argument.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.rules) | 0;
    result = result * 31 + Kotlin.hashCode(this.topRule) | 0;
    result = result * 31 + Kotlin.hashCode(this.conclusion) | 0;
    result = result * 31 + Kotlin.hashCode(this.groundings) | 0;
    result = result * 31 + Kotlin.hashCode(this.defeasibleRules) | 0;
    result = result * 31 + Kotlin.hashCode(this.defeasiblePremises) | 0;
    result = result * 31 + Kotlin.hashCode(this.lastDefeasibleRules) | 0;
    return result;
  };
  Argument.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.rules, other.rules) && Kotlin.equals(this.topRule, other.topRule) && Kotlin.equals(this.conclusion, other.conclusion) && Kotlin.equals(this.groundings, other.groundings) && Kotlin.equals(this.defeasibleRules, other.defeasibleRules) && Kotlin.equals(this.defeasiblePremises, other.defeasiblePremises) && Kotlin.equals(this.lastDefeasibleRules, other.lastDefeasibleRules)))));
  };
  function Attack(attacker, target, type, on) {
    if (type === void 0)
      type = null;
    if (on === void 0)
      on = null;
    this.attacker = attacker;
    this.target = target;
    this.type = type;
    this.on = on;
  }
  Attack.prototype.toString = function () {
    var tmp$, tmp$_0, tmp$_1;
    return 'attack(' + ((tmp$ = this.type) != null ? tmp$ : 'none') + ', ' + this.attacker.termRepresentation() + ', ' + this.target.termRepresentation() + ', ' + ((tmp$_1 = (tmp$_0 = this.on) != null ? tmp$_0.termRepresentation() : null) != null ? tmp$_1 : 'none').toString() + ')';
  };
  Attack.prototype.toTerm = function () {
    return parse_1(Struct.Companion, this.toString());
  };
  Attack.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Attack',
    interfaces: []
  };
  Attack.prototype.component1 = function () {
    return this.attacker;
  };
  Attack.prototype.component2 = function () {
    return this.target;
  };
  Attack.prototype.component3 = function () {
    return this.type;
  };
  Attack.prototype.component4 = function () {
    return this.on;
  };
  Attack.prototype.copy_ap9ihh$ = function (attacker, target, type, on) {
    return new Attack(attacker === void 0 ? this.attacker : attacker, target === void 0 ? this.target : target, type === void 0 ? this.type : type, on === void 0 ? this.on : on);
  };
  Attack.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.attacker) | 0;
    result = result * 31 + Kotlin.hashCode(this.target) | 0;
    result = result * 31 + Kotlin.hashCode(this.type) | 0;
    result = result * 31 + Kotlin.hashCode(this.on) | 0;
    return result;
  };
  Attack.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.attacker, other.attacker) && Kotlin.equals(this.target, other.target) && Kotlin.equals(this.type, other.type) && Kotlin.equals(this.on, other.on)))));
  };
  function Graph(arguments_0, attacks, supports) {
    Graph$Companion_getInstance();
    this.arguments = arguments_0;
    this.attacks = attacks;
    this.supports = supports;
    this.labellings = emptyList();
  }
  function Graph$Companion() {
    Graph$Companion_instance = this;
  }
  Graph$Companion.prototype.of_mf1h1a$ = function (labellings, attacks, supports) {
    var destination = ArrayList_init(collectionSizeOrDefault(labellings, 10));
    var tmp$;
    tmp$ = labellings.iterator();
    while (tmp$.hasNext()) {
      var item = tmp$.next();
      destination.add_11rb$(item.argument);
    }
    var $receiver = new Graph(destination, attacks, supports);
    $receiver.labellings = labellings;
    return $receiver;
  };
  Graph$Companion.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Companion',
    interfaces: []
  };
  var Graph$Companion_instance = null;
  function Graph$Companion_getInstance() {
    if (Graph$Companion_instance === null) {
      new Graph$Companion();
    }return Graph$Companion_instance;
  }
  Graph.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Graph',
    interfaces: []
  };
  Graph.prototype.component1 = function () {
    return this.arguments;
  };
  Graph.prototype.component2 = function () {
    return this.attacks;
  };
  Graph.prototype.component3 = function () {
    return this.supports;
  };
  Graph.prototype.copy_3lhab9$ = function (arguments_0, attacks, supports) {
    return new Graph(arguments_0 === void 0 ? this.arguments : arguments_0, attacks === void 0 ? this.attacks : attacks, supports === void 0 ? this.supports : supports);
  };
  Graph.prototype.toString = function () {
    return 'Graph(arguments=' + Kotlin.toString(this.arguments) + (', attacks=' + Kotlin.toString(this.attacks)) + (', supports=' + Kotlin.toString(this.supports)) + ')';
  };
  Graph.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.arguments) | 0;
    result = result * 31 + Kotlin.hashCode(this.attacks) | 0;
    result = result * 31 + Kotlin.hashCode(this.supports) | 0;
    return result;
  };
  Graph.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.arguments, other.arguments) && Kotlin.equals(this.attacks, other.attacks) && Kotlin.equals(this.supports, other.supports)))));
  };
  function LabelledArgument(argument, label) {
    this.argument = argument;
    this.label = label;
  }
  LabelledArgument.prototype.toString = function () {
    return this.label + '(' + this.argument.termRepresentation() + ')';
  };
  LabelledArgument.prototype.toTerm = function () {
    return parse_1(Struct.Companion, this.toString());
  };
  LabelledArgument.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'LabelledArgument',
    interfaces: []
  };
  LabelledArgument.prototype.component1 = function () {
    return this.argument;
  };
  LabelledArgument.prototype.component2 = function () {
    return this.label;
  };
  LabelledArgument.prototype.copy_8rskr$ = function (argument, label) {
    return new LabelledArgument(argument === void 0 ? this.argument : argument, label === void 0 ? this.label : label);
  };
  LabelledArgument.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.argument) | 0;
    result = result * 31 + Kotlin.hashCode(this.label) | 0;
    return result;
  };
  LabelledArgument.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.argument, other.argument) && Kotlin.equals(this.label, other.label)))));
  };
  function ArgItem() {
  }
  ArgItem.prototype.toTerm = function () {
    return parse_1(Struct.Companion, this.toString());
  };
  ArgItem.$metadata$ = {
    kind: Kind_INTERFACE,
    simpleName: 'ArgItem',
    interfaces: []
  };
  function Premise(identifier, conclusion, strict) {
    if (strict === void 0)
      strict = false;
    this.identifier_iai0l4$_0 = identifier;
    this.conclusion_vh7k5e$_0 = conclusion;
    this.strict = strict;
  }
  Object.defineProperty(Premise.prototype, 'identifier', {
    get: function () {
      return this.identifier_iai0l4$_0;
    }
  });
  Object.defineProperty(Premise.prototype, 'conclusion', {
    get: function () {
      return this.conclusion_vh7k5e$_0;
    }
  });
  Premise.prototype.toString = function () {
    return 'premise([' + this.identifier + ', ' + this.conclusion + '])';
  };
  Premise.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Premise',
    interfaces: [ArgItem]
  };
  Premise.prototype.component1 = function () {
    return this.identifier;
  };
  Premise.prototype.component2 = function () {
    return this.conclusion;
  };
  Premise.prototype.component3 = function () {
    return this.strict;
  };
  Premise.prototype.copy_qz9155$ = function (identifier, conclusion, strict) {
    return new Premise(identifier === void 0 ? this.identifier : identifier, conclusion === void 0 ? this.conclusion : conclusion, strict === void 0 ? this.strict : strict);
  };
  Premise.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.identifier) | 0;
    result = result * 31 + Kotlin.hashCode(this.conclusion) | 0;
    result = result * 31 + Kotlin.hashCode(this.strict) | 0;
    return result;
  };
  Premise.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.identifier, other.identifier) && Kotlin.equals(this.conclusion, other.conclusion) && Kotlin.equals(this.strict, other.strict)))));
  };
  function Rule(identifier, premises, conclusion, strict) {
    if (strict === void 0)
      strict = false;
    this.identifier_dmumzp$_0 = identifier;
    this.premises = premises;
    this.conclusion_g53ff$_0 = conclusion;
    this.strict = strict;
  }
  Object.defineProperty(Rule.prototype, 'identifier', {
    get: function () {
      return this.identifier_dmumzp$_0;
    }
  });
  Object.defineProperty(Rule.prototype, 'conclusion', {
    get: function () {
      return this.conclusion_g53ff$_0;
    }
  });
  Rule.prototype.toString = function () {
    return 'rule([' + this.identifier + ', ' + this.premises + ', ' + this.conclusion + '])';
  };
  Rule.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Rule',
    interfaces: [ArgItem]
  };
  Rule.prototype.component1 = function () {
    return this.identifier;
  };
  Rule.prototype.component2 = function () {
    return this.premises;
  };
  Rule.prototype.component3 = function () {
    return this.conclusion;
  };
  Rule.prototype.component4 = function () {
    return this.strict;
  };
  Rule.prototype.copy_fx7y9c$ = function (identifier, premises, conclusion, strict) {
    return new Rule(identifier === void 0 ? this.identifier : identifier, premises === void 0 ? this.premises : premises, conclusion === void 0 ? this.conclusion : conclusion, strict === void 0 ? this.strict : strict);
  };
  Rule.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.identifier) | 0;
    result = result * 31 + Kotlin.hashCode(this.premises) | 0;
    result = result * 31 + Kotlin.hashCode(this.conclusion) | 0;
    result = result * 31 + Kotlin.hashCode(this.strict) | 0;
    return result;
  };
  Rule.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.identifier, other.identifier) && Kotlin.equals(this.premises, other.premises) && Kotlin.equals(this.conclusion, other.conclusion) && Kotlin.equals(this.strict, other.strict)))));
  };
  function Support(supporter, supported) {
    this.supporter = supporter;
    this.supported = supported;
  }
  Support.prototype.toString = function () {
    return 'support(' + this.supporter.termRepresentation() + ', ' + this.supported.termRepresentation() + ')';
  };
  Support.prototype.toTerm = function () {
    return parse_1(Struct.Companion, this.toString());
  };
  Support.$metadata$ = {
    kind: Kind_CLASS,
    simpleName: 'Support',
    interfaces: []
  };
  Support.prototype.component1 = function () {
    return this.supporter;
  };
  Support.prototype.component2 = function () {
    return this.supported;
  };
  Support.prototype.copy_9dngue$ = function (supporter, supported) {
    return new Support(supporter === void 0 ? this.supporter : supporter, supported === void 0 ? this.supported : supported);
  };
  Support.prototype.hashCode = function () {
    var result = 0;
    result = result * 31 + Kotlin.hashCode(this.supporter) | 0;
    result = result * 31 + Kotlin.hashCode(this.supported) | 0;
    return result;
  };
  Support.prototype.equals = function (other) {
    return this === other || (other !== null && (typeof other === 'object' && (Object.getPrototypeOf(this) === Object.getPrototypeOf(other) && (Kotlin.equals(this.supporter, other.supporter) && Kotlin.equals(this.supported, other.supported)))));
  };
  function EngineInterface() {
    EngineInterface_instance = this;
    EngineInterfaceBase.call(this);
  }
  Object.defineProperty(EngineInterface.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return ArgumentationEngineInterface_getInstance().theoryCode;
    }
  });
  EngineInterface.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'EngineInterface',
    interfaces: [EngineInterfaceBase]
  };
  var EngineInterface_instance = null;
  function EngineInterface_getInstance() {
    if (EngineInterface_instance === null) {
      new EngineInterface();
    }return EngineInterface_instance;
  }
  function AbstractMode() {
    AbstractMode_instance = this;
    AbstractModeBase.call(this);
  }
  Object.defineProperty(AbstractMode.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return AbstractMode_getInstance_0().theoryCode;
    }
  });
  AbstractMode.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'AbstractMode',
    interfaces: [AbstractModeBase]
  };
  var AbstractMode_instance = null;
  function AbstractMode_getInstance() {
    if (AbstractMode_instance === null) {
      new AbstractMode();
    }return AbstractMode_instance;
  }
  function ArgumentationGraphBuilder() {
    ArgumentationGraphBuilder_instance = this;
    ArgumentationGraphBuilderBase.call(this);
  }
  Object.defineProperty(ArgumentationGraphBuilder.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return ArgumentationGraph_getInstance().theoryCode;
    }
  });
  ArgumentationGraphBuilder.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ArgumentationGraphBuilder',
    interfaces: [ArgumentationGraphBuilderBase]
  };
  var ArgumentationGraphBuilder_instance = null;
  function ArgumentationGraphBuilder_getInstance() {
    if (ArgumentationGraphBuilder_instance === null) {
      new ArgumentationGraphBuilder();
    }return ArgumentationGraphBuilder_instance;
  }
  function AttackRestrictionHandler() {
    AttackRestrictionHandler_instance = this;
    AttackRestrictionHandlerBase.call(this);
  }
  Object.defineProperty(AttackRestrictionHandler.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return AttackRestriction_getInstance().theoryCode;
    }
  });
  AttackRestrictionHandler.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'AttackRestrictionHandler',
    interfaces: [AttackRestrictionHandlerBase]
  };
  var AttackRestrictionHandler_instance = null;
  function AttackRestrictionHandler_getInstance() {
    if (AttackRestrictionHandler_instance === null) {
      new AttackRestrictionHandler();
    }return AttackRestrictionHandler_instance;
  }
  function BpMetaGraphHandler() {
    BpMetaGraphHandler_instance = this;
    BpMetaGraphHandlerBase.call(this);
  }
  Object.defineProperty(BpMetaGraphHandler.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return Bp_getInstance().theoryCode;
    }
  });
  BpMetaGraphHandler.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BpMetaGraphHandler',
    interfaces: [BpMetaGraphHandlerBase]
  };
  var BpMetaGraphHandler_instance = null;
  function BpMetaGraphHandler_getInstance() {
    if (BpMetaGraphHandler_instance === null) {
      new BpMetaGraphHandler();
    }return BpMetaGraphHandler_instance;
  }
  function DefeasiblePreferencesHandler() {
    DefeasiblePreferencesHandler_instance = this;
    DefeasiblePreferencesHandlerBase.call(this);
  }
  Object.defineProperty(DefeasiblePreferencesHandler.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return DefPreferences_getInstance().theoryCode;
    }
  });
  DefeasiblePreferencesHandler.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'DefeasiblePreferencesHandler',
    interfaces: [DefeasiblePreferencesHandlerBase]
  };
  var DefeasiblePreferencesHandler_instance = null;
  function DefeasiblePreferencesHandler_getInstance() {
    if (DefeasiblePreferencesHandler_instance === null) {
      new DefeasiblePreferencesHandler();
    }return DefeasiblePreferencesHandler_instance;
  }
  function GenericDefeasiblePreferencesHandler() {
    GenericDefeasiblePreferencesHandler_instance = this;
    GenericDefeasiblePreferencesHandlerBase.call(this);
  }
  Object.defineProperty(GenericDefeasiblePreferencesHandler.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return GenericDefPreferences_getInstance().theoryCode;
    }
  });
  GenericDefeasiblePreferencesHandler.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'GenericDefeasiblePreferencesHandler',
    interfaces: [GenericDefeasiblePreferencesHandlerBase]
  };
  var GenericDefeasiblePreferencesHandler_instance = null;
  function GenericDefeasiblePreferencesHandler_getInstance() {
    if (GenericDefeasiblePreferencesHandler_instance === null) {
      new GenericDefeasiblePreferencesHandler();
    }return GenericDefeasiblePreferencesHandler_instance;
  }
  function StrictPreferencesHandler() {
    StrictPreferencesHandler_instance = this;
    StrictPreferencesHandlerBase.call(this);
  }
  Object.defineProperty(StrictPreferencesHandler.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return Preferences_getInstance().theoryCode;
    }
  });
  StrictPreferencesHandler.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'StrictPreferencesHandler',
    interfaces: [StrictPreferencesHandlerBase]
  };
  var StrictPreferencesHandler_instance = null;
  function StrictPreferencesHandler_getInstance() {
    if (StrictPreferencesHandler_instance === null) {
      new StrictPreferencesHandler();
    }return StrictPreferencesHandler_instance;
  }
  function BpCompleteLabeller() {
    BpCompleteLabeller_instance = this;
    BpCompleteLabellerBase.call(this);
  }
  Object.defineProperty(BpCompleteLabeller.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return BpGroundedComplete_getInstance().theoryCode;
    }
  });
  BpCompleteLabeller.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BpCompleteLabeller',
    interfaces: [BpCompleteLabellerBase]
  };
  var BpCompleteLabeller_instance = null;
  function BpCompleteLabeller_getInstance() {
    if (BpCompleteLabeller_instance === null) {
      new BpCompleteLabeller();
    }return BpCompleteLabeller_instance;
  }
  function BpLabeller() {
    BpLabeller_instance = this;
    BpLabellerBase.call(this);
  }
  Object.defineProperty(BpLabeller.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return BpGrounded_getInstance().theoryCode;
    }
  });
  BpLabeller.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BpLabeller',
    interfaces: [BpLabellerBase]
  };
  var BpLabeller_instance = null;
  function BpLabeller_getInstance() {
    if (BpLabeller_instance === null) {
      new BpLabeller();
    }return BpLabeller_instance;
  }
  function BpPartialLabeller() {
    BpPartialLabeller_instance = this;
    BpPartialLabellerBase.call(this);
  }
  Object.defineProperty(BpPartialLabeller.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return BpGroundedPartial_getInstance().theoryCode;
    }
  });
  BpPartialLabeller.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BpPartialLabeller',
    interfaces: [BpPartialLabellerBase]
  };
  var BpPartialLabeller_instance = null;
  function BpPartialLabeller_getInstance() {
    if (BpPartialLabeller_instance === null) {
      new BpPartialLabeller();
    }return BpPartialLabeller_instance;
  }
  function CompleteLabeller() {
    CompleteLabeller_instance = this;
    CompleteLabellerBase.call(this);
  }
  Object.defineProperty(CompleteLabeller.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return Complete_getInstance().theoryCode;
    }
  });
  CompleteLabeller.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'CompleteLabeller',
    interfaces: [CompleteLabellerBase]
  };
  var CompleteLabeller_instance = null;
  function CompleteLabeller_getInstance() {
    if (CompleteLabeller_instance === null) {
      new CompleteLabeller();
    }return CompleteLabeller_instance;
  }
  function GroundedLabeller() {
    GroundedLabeller_instance = this;
    GroundedLabellerBase.call(this);
  }
  Object.defineProperty(GroundedLabeller.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return Grounded_getInstance().theoryCode;
    }
  });
  GroundedLabeller.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'GroundedLabeller',
    interfaces: [GroundedLabellerBase]
  };
  var GroundedLabeller_instance = null;
  function GroundedLabeller_getInstance() {
    if (GroundedLabeller_instance === null) {
      new GroundedLabeller();
    }return GroundedLabeller_instance;
  }
  function StatementLabeller() {
    StatementLabeller_instance = this;
    StatementLabellerBase.call(this);
  }
  Object.defineProperty(StatementLabeller.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return StatementLabelling_getInstance().theoryCode;
    }
  });
  StatementLabeller.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'StatementLabeller',
    interfaces: [StatementLabellerBase]
  };
  var StatementLabeller_instance = null;
  function StatementLabeller_getInstance() {
    if (StatementLabeller_instance === null) {
      new StatementLabeller();
    }return StatementLabeller_instance;
  }
  function RuleParser() {
    RuleParser_instance = this;
    RuleParserBase.call(this);
  }
  Object.defineProperty(RuleParser.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return RuleTranslator_getInstance().theoryCode;
    }
  });
  RuleParser.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'RuleParser',
    interfaces: [RuleParserBase]
  };
  var RuleParser_instance = null;
  function RuleParser_getInstance() {
    if (RuleParser_instance === null) {
      new RuleParser();
    }return RuleParser_instance;
  }
  function AbstractMode_0() {
    AbstractMode_instance_0 = this;
    this.theoryCode = trimIndent('\n    computeGlobalAcceptance :-\n        buildGraph,\n        modifyGraph,\n        buildArgumentLabelling,\n        buildStatementLabelling.\n    computeGlobalAcceptance([Arguments, Attacks, Supports], [ArgsIn, ArgsOut, ArgsUnd], [StatIn, StatOut, StatUnd]) :-\n        computeGlobalAcceptance,\n        utils::recoverGraph(Arguments, Attacks, Supports),\n        utils::recoverArgumentLabelling(ArgsIn, ArgsOut, ArgsUnd),\n        utils::recoverStatementLabelling(StatIn, StatOut, StatUnd).\n    buildGraph :-\n        graphBuildMode(X),\n        X:::buildArgumentationGraph.\n    modifyGraph :-\n        findall(X, graphExtension(X), Ext),\n        modifyGraph(Ext).\n    modifyGraph([]).\n    modifyGraph([X|Ext]) :-\n        modifyGraph(Ext),\n        X:::modifyArgumentationGraph.\n    buildArgumentLabelling :-\n        argumentLabellingMode(X),\n        X:::argumentLabelling.\n    buildStatementLabelling :-\n        statementLabellingMode(X),\n        X:::statementLabelling.\n        ');
  }
  AbstractMode_0.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'AbstractMode',
    interfaces: []
  };
  var AbstractMode_instance_0 = null;
  function AbstractMode_getInstance_0() {
    if (AbstractMode_instance_0 === null) {
      new AbstractMode_0();
    }return AbstractMode_instance_0;
  }
  function ArgumentationEngineInterface() {
    ArgumentationEngineInterface_instance = this;
    this.theoryCode = trimIndent('\n    argTuProlog.\n    buildLabelSets([StatIn, StatOut, StatUnd], [ArgsIn, ArgsOut, ArgsUnd]) :-\n        context_reset,\n        parser:::convertAllRules(_),\n        abstract::computeGlobalAcceptance(_, [ArgsIn, ArgsOut, ArgsUnd], [StatIn, StatOut, StatUnd]).\n    buildLabelSets(StatIn, StatOut, StatUnd) :-\n        buildLabelSets([StatIn, StatOut, StatUnd], _).\n    buildLabelSets :-\n        context_reset,\n        parser:::convertAllRules(ArgRules),\n        debug::printTheory(ArgRules),\n        abstract::computeGlobalAcceptance([Arguments, Attacks, Supports], [ArgsIn, ArgsOut, ArgsUnd], [StatIn, StatOut, StatUnd]),\n        debug::printArgumentationGraph(Arguments, Attacks, Supports),\n        debug::printArgumentLabelling([ArgsIn, ArgsOut, ArgsUnd]),\n        debug::printStatementLabelling([StatIn, StatOut, StatUnd]).\n    answerQuery(Goal, Yes, No, Und) :-\n        context_reset,\n        parser:::convertAllRules(_),\n        structured:::computeStatementAcceptance(Goal, Yes, No, Und).\n        ');
  }
  ArgumentationEngineInterface.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ArgumentationEngineInterface',
    interfaces: []
  };
  var ArgumentationEngineInterface_instance = null;
  function ArgumentationEngineInterface_getInstance() {
    if (ArgumentationEngineInterface_instance === null) {
      new ArgumentationEngineInterface();
    }return ArgumentationEngineInterface_instance;
  }
  function ArgumentationGraph() {
    ArgumentationGraph_instance = this;
    this.theoryCode = trimIndent('\n    buildArgumentationGraph :-\n        buildArguments,\n        buildAttacks.\n    buildArguments :-\n    \tbuildArgumentsFromPremises,\n    \tfindall([RuleID, RuleBody, RuleHead], context_check(rule([RuleID, RuleBody, RuleHead])), Rules),\n    \tbuildArgumentsFromRules(Rules, Rules, n).\n    buildArgumentsFromPremises :-\n        findall(\n            _,\n            (\n                context_check(premise([PremiseID, Premise])),\n                checkStrict(PremiseID, DefPrem),\n                ground(Premise),\n                context_assert(argument([[PremiseID], none, Premise, [], [[], [], DefPrem]]))\n            ),\n            _\n        ).\n    buildArgumentsFromRules(Rules, [], n).\n    buildArgumentsFromRules(Rules, [], y) :- buildArgumentsFromRules(Rules, Rules, n).\n    buildArgumentsFromRules(Rules, [H|T], _) :-\n        copy_term(H, HH),\n        buildArgumentsFromRule(HH),\n        buildArgumentsFromRules(Rules, T, y), !.\n    buildArgumentsFromRules(Rules, [_|T], X) :-\n        buildArgumentsFromRules(Rules, T, X).\n    buildArgumentsFromRule([RuleID, RuleBody, RuleHead]) :-\n    \truleBodyIsSupported(RuleBody, [], [], SupportRules, ArgSupports),\n    \t\\+ member(RuleID, SupportRules),\n    \tground(RuleHead),\n    \tutils::sort([RuleID|SupportRules], SortedPremises),\n    \t\\+ context_check(argument([SortedPremises, RuleID, RuleHead, RuleBody, _])),\n    \tbuildArgumentInfo(ArgSupports, RuleID, Info),\n        NewArgument = [SortedPremises, RuleID, RuleHead, RuleBody, Info],\n    \tcontext_assert(argument(NewArgument)),\n    \tsupports(NewArgument, ArgSupports).\n    supports(Argument, Supports) :-\n        findall(_, (\n            member(S, Supports),\n            context_assert(support(S, Argument))\n        ), _).\n    checkStrict(Id, [Id]) :- \\+ context_check(strict(Id)).\n    checkStrict(Id, []) :- context_check(strict(Id)).\n    buildArgumentInfo(Supports, RuleId, [LastDefRules, DefRules, DefPrem]) :-\n        defeasibleRules(RuleId, Supports, DefRules),\n        ordinaryPremises(Supports, DefPrem),\n        lastDefeasibleRules(Supports, RuleId, LastDefRules).\n    ordinaryPremises(Supports, DefPrem) :-\n        findall(Def, member([_, _, _, _, [_, _, Def]], Supports), Prem),\n        utils::appendLists(Prem, TempPrem),\n        utils::sortDistinct(TempPrem, DefPrem).\n    defeasibleRules(RuleId, Supports, DefRules) :-\n    \tfindall(Def, member([_, _, _, _, [_, Def, _]], Supports), UnsortedRules),\n    \tcheckStrict(RuleId, DefRule),\n    \tutils::appendLists([DefRule|UnsortedRules], TempRules),\n    \tutils::sortDistinct(TempRules, DefRules).\n    lastDefeasibleRules(_, TopRule, [TopRule]) :-\n        TopRule \\== none, \\+ context_check(strict(TopRule)).\n    lastDefeasibleRules(Supports, TopRule, LastRules) :-\n    \tcontext_check(strict(TopRule)),\n    \tfindall(Def, member([_, _, _, _, [Def, _, _]], Supports), Res),\n    \tutils::appendLists(Res, TempLastRules),\n    \tutils::sortDistinct(TempLastRules, LastRules).\n    ruleBodyIsSupported([], ResultPremises, ResultSupports, ResultPremises, ResultSupports).\n    ruleBodyIsSupported([ [unless, _] | Others], Premises, Supports, ResultPremises, ResultSupports) :-\n    \truleBodyIsSupported(Others, Premises, Supports, ResultPremises, ResultSupports).\n    ruleBodyIsSupported([ [prolog(Check)] | Others], Premises, Supports, ResultPremises, ResultSupports) :-\n    \t(callable(Check) -> call(Check); Check),\n    \truleBodyIsSupported(Others, Premises, Supports, ResultPremises, ResultSupports).\n    ruleBodyIsSupported([Statement|Others], Premises, Supports, ResultPremises, ResultSupports) :-\n        context_check(argument([ArgumentID, RuleID, Statement, Body, Info])),\n    \tappend(ArgumentID, Premises, NewPremises),\n    \truleBodyIsSupported(Others, NewPremises, [[ArgumentID, RuleID, Statement, Body, Info]|Supports], ResultPremises, ResultSupports).\n    buildAttacks :-\n        findall(X, context_check(argument(X)), Args),\n    \tbuildDirectAttacks(Args),\n    \tbuildTransitiveAttacks.\n    buildDirectAttacks([]).\n    buildDirectAttacks([H|T]) :-\n        findall(_, buildDirectAttack(H), _),\n        buildDirectAttacks(T).\n    buildDirectAttack(A) :-\n    \tcontext_check(argument(B)),\n    \tA \\== B,\n        attacks(T, A, B),\n    \t\\+ context_check(attack(T, A, B, B)),\n    \tcontext_assert(attack(T, A, B, B)).\n    buildTransitiveAttacks :-\n    \tcontext_check(attack(T, A, B, D)),\n    \tcontext_check(support(B, C)),\n    \t\\+ context_check(attack(T, A, C, D)), !,\n    \tcontext_assert(attack(T, A, C, D)),\n        buildTransitiveAttacks.\n    buildTransitiveAttacks.\n    attacks(rebut, A, B) :- rebuts(A, B), !.\n    attacks(contrary_rebut, A, B) :- contraryRebuts(A, B), !.\n    attacks(undermine, A, B) :- undermines(A, B), !.\n    attacks(contrary_undermine, A, B) :- contraryUndermines(A, B), !.\n    attacks(undercut, A, B) :- undercuts(A, B), !.\n    rebuts([IDPremisesA, RuleA, RuleHeadA, _, _], [IDPremisesB, RuleB, RuleHeadB, _, Info]) :-\n    \tRuleB \\== none,\n        Info \\== [[], [], []],\n    \tconflict(RuleHeadA, RuleHeadB).\n    contraryRebuts([IDPremisesA, RuleA, RuleHeadA, _, _], [IDPremisesB, RuleB, RuleHeadB, Body, Info]) :-\n    \tRuleA \\== none,\n    \tRuleB \\== none,\n    \tmember([unless, RuleHeadA], Body).\n    undermines([IDPremisesA, RuleA, RuleHeadA, _, _], [[IDPremiseB], none, RuleHeadB, _, Info]) :-\n    \tInfo \\== [[], [], []],\n    \tconflict(RuleHeadA, RuleHeadB).\n    contraryUndermines([IDPremisesA, none, RuleHeadA, _, _], [IDPremisesB, RuleB, RuleHeadB, Body, Info]) :-\n    \tRuleB \\== none,\n    \tmember([unless, RuleHeadA], Body).\n    undercuts([_, _, [undercut(RuleB)], _, _], [_, RuleB, _, _, [[RuleB], _, _]]).\n    conflict( [Atom], [neg, Atom]).\n    conflict( [neg, Atom], [Atom]).\n    conflict( [obl, [Atom]],  [obl, [neg, Atom]]).\n    conflict( [obl, [neg, Atom]],  [obl, [Atom]]).\n    conflict( [obl, Lit],  [neg, obl, Lit]).\n    conflict( [neg, obl, Lit],  [obl, Lit]).\n    conflict( [perm, [Atom]],  [obl, [neg, Atom]]).\n    conflict( [obl, [neg, Atom]],  [perm, [Atom]]).\n    conflict( [perm, [neg, Atom]],  [obl, [Atom]]).\n    conflict( [obl, [Atom]],  [perm, [neg, Atom]]).\n    conflict([bp, Atom], [neg, bp, Atom]).\n    conflict([neg, bp, Atom], [bp, Atom]).\n    conflict([sup(X, Y)],  [sup(Y, X)]).\n        ');
  }
  ArgumentationGraph.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'ArgumentationGraph',
    interfaces: []
  };
  var ArgumentationGraph_instance = null;
  function ArgumentationGraph_getInstance() {
    if (ArgumentationGraph_instance === null) {
      new ArgumentationGraph();
    }return ArgumentationGraph_instance;
  }
  function AttackRestriction() {
    AttackRestriction_instance = this;
    this.theoryCode = trimIndent('\n    modifyArgumentationGraph :-\n        findall(_, (\n            context_check(attack(T, A, B, C)),\n            checkRebutRestriction(T, A, B, C)\n        ), _).\n    checkRebutRestriction(T, A, B, C) :-\n        \\+ rebutRestriction(T, A, B, C),\n        context_retract(attack(T, A, B, C)).\n    rebutRestriction(rebut, _, _, C) :- restrict(C).\n    rebutRestriction(undermine, _, _, C).\n    rebutRestriction(contrary_rebut, _, _, _).\n    rebutRestriction(contrary_undermine, _, _, _).\n    rebutRestriction(undercut, _, _, _).\n    restrict([_, TopRule, _, _, [[TopRule], _, _]]) :- TopRule \\== none.\n        ');
  }
  AttackRestriction.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'AttackRestriction',
    interfaces: []
  };
  var AttackRestriction_instance = null;
  function AttackRestriction_getInstance() {
    if (AttackRestriction_instance === null) {
      new AttackRestriction();
    }return AttackRestriction_instance;
  }
  function Bp() {
    Bp_instance = this;
    this.theoryCode = trimIndent('\n    modifyArgumentationGraph :-\n        findall(([Rules, Top, [bp, Checked], G, I], [Z, P, Y, GG, II]), (\n            context_check(argument([Rules, Top, [bp, Checked], G, I])),\n            member(Y, Checked),\n            context_check(argument([Z, P, Y, GG, II]))\n        ), TemplateBpPairs),\n        checkBpArguments(TemplateBpPairs).\n    checkBpArguments([]).\n    checkBpArguments(TemplateBpPairs) :-\n        createBpArguments(TemplateBpPairs, BpPairs),\n        createBpAttacks(BpPairs).\n    createBpArguments([], []).\n    createBpArguments([(Original, [Z, P, Y, B, I])|Others], [(Conflict, [Z, P, Y, B, I])|BpPairs]) :-\n        Conflict = [[artificial|Z], artificial, [neg, burdmet(Y)], [], [[artificial], [artificial], []]],\n        context_assert(argument(Conflict)),\n        context_assert(support(Original, Conflict)),\n        liftBpAttacks(Original, Conflict),\n        createBpArguments(Others, BpPairs).\n    liftBpAttacks(Template, BpArg) :-\n        findall(_, (\n            context_check(attack(T, A, Template, O)),\n            context_assert(attack(T, A, BpArg, O))\n        ), _).\n    createBpAttacks(BpPairs) :-\n        generateBpsEvaluationChain(BpPairs, OrderedBpPairs),\n        evaluateBurdenedArgs(OrderedBpPairs).\n    generateBpsEvaluationChain([], []).\n    generateBpsEvaluationChain([BpPair|BpPairs], OrderedBpPairs) :-\n        generateBpsEvaluationChain(BpPairs, TempOrderedBpPairs),\n        insertBpPair(BpPair, TempOrderedBpPairs, OrderedBpPairs).\n    insertBpPair(BpPair, [], [BpPair]).\n    insertBpPair((Bp, Burdened), [(BpL, BurdenedL)|Others], [(BpL, BurdenedL)|Return]) :-\n        bp_grounded::argumentChain(BurdenedL, Burdened),\n        insertBpPair((Bp, Burdened), Others, Return), !.\n    insertBpPair((Bp, Burdened), [(BpL, BurdenedL)|Others], [(Bp, Burdened)|[(BpL, BurdenedL)|Others]]).\n    evaluateBurdenedArgs([]).\n    evaluateBurdenedArgs([(Bp, Burdened)|Others]) :-\n        context_active(X),\n        grounded:::argumentLabelling,\n        statusToAttack((Bp, Burdened), Attack),\n        context_checkout(X),\n        context_assert(Attack),\n        evaluateBurdenedArgs(Others).\n    statusToAttack((Bp, Burdened), attack(bprebut, Burdened, Bp, Bp)) :-\n        context_check(in(Burdened)).\n    statusToAttack((Bp, Burdened), attack(bprebut, Bp, Burdened, Burdened)) :-\n        \\+ context_check(in(Burdened)).\n        ');
  }
  Bp.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Bp',
    interfaces: []
  };
  var Bp_instance = null;
  function Bp_getInstance() {
    if (Bp_instance === null) {
      new Bp();
    }return Bp_instance;
  }
  function BpGrounded() {
    BpGrounded_instance = this;
    this.theoryCode = trimIndent('\n    argumentLabelling :-\n        reifyBurdenOfProofs,\n        filterBpDefeats,\n        findall(X, context_check(argument(X)), Arguments),\n        bpLabelling(Arguments).\n    bpLabelling(Arguments) :-\n        member(A, Arguments),\n        grounded::allAttacksOUT(A), !,\n        context_assert(in(A)),\n        utils::subtract(Arguments, [A], NewArguments),\n        bpLabelling(NewArguments).\n    bpLabelling(Arguments) :-\n        member(A, Arguments),\n        \\+ isArgumentInBurdenOfProof(A),\n        grounded::oneAttackIN(A), !,\n        context_assert(out(A)),\n        utils::subtract(Arguments, [A], NewArguments),\n        bpLabelling(NewArguments).\n    bpLabelling(Arguments) :-\n        context_active(Branch),\n        mostGroundedBpUnd(Arguments, A),\n        context_branch(Branch, _),\n        context_assert(out(A)),\n        utils::subtract(Arguments, [A], NewArguments),\n        bpLabelling(NewArguments).\n    bpLabelling(Args) :-\n        notLabelled(Args),\n        findall(_, (member(A, Args), context_assert(und(A))), _).\n    notLabelled(Args) :-\n        \\+ (\n            member(A, Args),\n            (\n                context_check(in(A));\n                context_check(out(A));\n                context_check(und(A))\n            )\n        ).\n    isInBurdenOfProof(Conclusion) :-\n        context_check(reifiedBp(Literals)),\n        member(Conclusion, Literals), !.\n    isArgumentInBurdenOfProof([_, _, Conclusion, _, _]) :-\n        isInBurdenOfProof(Conclusion).\n    filterBpDefeats :-\n        findall(_, (\n            context_check(attack(T, A, B, C)),\n            filterBpDefeat(T, A, B, C)\n        ), _).\n    filterBpDefeat(T, B, A, C) :-\n        (T = rebut; T = undermine),\n        isArgumentInBurdenOfProof(B),\n        \\+ superiority::superiorArgument(B, C),\n        context_retract(attack(T, B, A, C)).\n    mostGroundedBpUnd(Arguments, Arg) :-\n        member(Arg, Arguments),\n        isArgumentInBurdenOfProof(Arg),\n        \\+ (\n            member(A, Arguments), Arg \\= A,\n            isArgumentInBurdenOfProof(A),\n            argumentChain(A, Arg)\n        ).\n    argumentChain(A, A) :- !.\n    argumentChain(A, B) :-\n        A \\== B,\n        context_check(attack(_, A, C, _)),\n        argumentChain(C, B).\n    reifyBurdenOfProofs :-\n        findall(_, (\n            context_check(abstractBp(AbstractBp)),\n            fillTemplate(AbstractBp, R),\n            \\+ context_check(reifiedBp(R)),\n            context_assert(reifiedBp(R))\n        ), _).\n    /*\n        Fill the template (first parameter) using arguments conclusions\n    */\n    fillTemplate([], []).\n    fillTemplate([H|T], [H|R]) :-\n        context_check(argument([_, _, Conclusion, _, _])),\n        fillTemplate(T, R).\n        ');
  }
  BpGrounded.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BpGrounded',
    interfaces: []
  };
  var BpGrounded_instance = null;
  function BpGrounded_getInstance() {
    if (BpGrounded_instance === null) {
      new BpGrounded();
    }return BpGrounded_instance;
  }
  function BpGroundedComplete() {
    BpGroundedComplete_instance = this;
    this.theoryCode = trimIndent('\n    argumentLabelling :-\n        bp_grounded::reifyBurdenOfProofs,\n        findall(X, context_check(argument(X)), Arguments),\n        completeBpLabelling(go, Arguments).\n    completeBpLabelling(stop, _).\n    completeBpLabelling(go, Arguments) :-\n        bp_grounded_partial::partialBpLabelling(Arguments), !,\n        findall(X, (context_check(und(X)), context_retract(und(X))), NewArgs),\n        grounded::groundedLabelling(NewArgs),\n        findall(X, context_check(und(X)), LeftArguments),\n        stopCondition(Stop, Arguments, LeftArguments),\n        completeBpLabelling(Stop, LeftArguments).\n    stopCondition(stop, Args, NewArgs) :-\n        utils::sort(Args, SortedArgs),\n        utils::sort(NewArgs, SortedArgs), !.\n    stopCondition(go, _, _) :- context_retract(und(_)).\n        ');
  }
  BpGroundedComplete.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BpGroundedComplete',
    interfaces: []
  };
  var BpGroundedComplete_instance = null;
  function BpGroundedComplete_getInstance() {
    if (BpGroundedComplete_instance === null) {
      new BpGroundedComplete();
    }return BpGroundedComplete_instance;
  }
  function BpGroundedPartial() {
    BpGroundedPartial_instance = this;
    this.theoryCode = trimIndent("\n    argumentLabelling :-\n        bp_grounded::reifyBurdenOfProofs,\n        findall(X, context_check(argument(X)), Arguments),\n        partialBpLabelling(Arguments), !.\n    partialBpLabelling([]).\n    partialBpLabelling(Arguments) :-\n        mostGroundedArgument(Arguments, A),\n        debug::writeDebug(['Evaluating ', A]),\n        demonstration(Arguments, A, [A], Evaluated),\n        utils::subtract(Arguments, [Evaluated], NewArgs),\n        partialBpLabelling(NewArgs).\n    /*\n        (a.i) BP(neg(\u03C6)), and no argument B for neg(\u03C6) such that A < B is IN*, and no A1,...An is OUT*\n    */\n    demonstration(Arguments, A, Resolving, A) :-\n    \tisComplementInBurdenOfProof(A),\n    \t\\+ notEvaluatedSuperiorComplementArgument(Arguments, A, Resolving, _),\n    \t\\+ (\n    \t    superiorComplementArgument(A, B),\n    \t    context_check(in(B))\n    \t),\n    \t\\+ notEvaluatedSubArgument(Arguments, A, Resolving, _),\n    \t\\+ (\n    \t    context_check(support(X, A)),\n    \t    context_check(out(X))\n    \t),\n    \tdebug::writeDebug(['Adding argument: ', A, ' to IN* (2.a.i)']),\n        context_assert(in(A)).\n    /*\n        (a.ii) not BP(neg(\u03C6)) and every argument B for neg(\u03C6) such that B(not <)A is OUT*, and every A1,...An is IN*\n    */\n    demonstration(Arguments, A, Resolving, A) :-\n    \t\\+ isComplementInBurdenOfProof(A),\n    \t\\+ notEvaluatedSuperiorOrEqualComplementArgument(Arguments, A, Resolving, _),\n    \t\\+ (\n            superiorOrEqualComplementArgument(A, B),\n            \\+ context_check(out(B))\n        ),\n    \t\\+ notEvaluatedSubArgument(Arguments, A, Resolving, _),\n    \t\\+ (\n            context_check(support(X, A)),\n            \\+ context_check(in(X))\n        ),\n    \tdebug::writeDebug(['Adding argument: ', A, ' to IN* (2.a.ii)']),\n        context_assert(in(A)).\n    /*\n        (b.i.1) BP(\u03C6) and exists an argument B for neg(\u03C6) such that B(not <)A is not OUT*\n    */\n    demonstration(Arguments, A, Resolving, A) :-\n    \tbp_grounded::isArgumentInBurdenOfProof(A),\n    \t\\+ notEvaluatedSuperiorOrEqualComplementArgument(Arguments, A, Resolving, _),\n    \tsuperiorOrEqualComplementArgument(A, B),\n    \t\\+ context_check(out(B)),\n        debug::writeDebug(['Adding argument: ', A, ' to OUT* (2.b.i.1)']),\n        context_assert(out(A)).\n    /*\n        (b.i.2) BP(\u03C6) and exist one of A1,...An is not IN*\n    */\n    demonstration(Arguments, A, Resolving, A) :-\n    \tbp_grounded::isArgumentInBurdenOfProof(A),\n    \t\\+ notEvaluatedSubArgument(Arguments, A, Resolving, _),\n    \tcontext_check(support(X, A)),\n        \\+ context_check(in(X)),\n        debug::writeDebug(['Adding argument: ', A, ' to OUT* (2.b.i.2)']),\n        context_assert(out(A)).\n    /*\n        (b.ii.1) not BP(\u03C6) and an argument B for neg(\u03C6) such A < B is IN*\n    */\n    demonstration(Arguments, A, Resolving, A) :-\n    \t\\+ bp_grounded::isArgumentInBurdenOfProof(A),\n    \t\\+ notEvaluatedSuperiorComplementArgument(Arguments, A, Resolving, _),\n    \tsuperiorComplementArgument(A, B),\n    \tcontext_check(in(B)),\n        debug::writeDebug(['Adding argument: ', A, ' to OUT* (2.b.ii.1)']),\n        context_assert(out(A)).\n    /*\n        (b.ii.2) not BP(\u03C6) and one of A1,...An is OUT*\n    */\n    demonstration(Arguments, A, Resolving, A) :-\n    \t\\+ bp_grounded::isArgumentInBurdenOfProof(A),\n    \t\\+ notEvaluatedSubArgument(Arguments, A, Resolving, _),\n    \tcontext_check(support(X, A)),\n        context_check(out(X)),\n        debug::writeDebug(['Adding argument: ', A, ' to OUT* (2.b.ii.2)']),\n        context_assert(out(A)).\n    /*\n        If above definitions do not apply try to decide on the arguments on which they depend\n    */\n    demonstration(Arguments, A, Resolving, Evaluated) :-\n        isComplementInBurdenOfProof(A),\n    \tnotEvaluatedSuperiorComplementArgument(Arguments, A, Resolving, B),\n        demonstration(Arguments, B, [B|Resolving], Evaluated).\n    demonstration(Arguments, A, Resolving, Evaluated) :-\n    \tisComplementInBurdenOfProof(A),\n    \t\\+ notEvaluatedSuperiorComplementArgument(Arguments, A, Resolving, _),\n    \t\\+ (\n            superiorComplementArgument(A, X),\n            context_check(in(X))\n        ),\n        notEvaluatedSubArgument(Arguments, A, Resolving, B),\n        demonstration(Arguments, B, [B|Resolving], Evaluated).\n    demonstration(Arguments, A, Resolving, Evaluated) :-\n        \\+ isComplementInBurdenOfProof(A),\n    \tnotEvaluatedSuperiorOrEqualComplementArgument(Arguments, A, Resolving, B),\n        demonstration(Arguments, B, [B|Resolving], Evaluated).\n    demonstration(Arguments, A, Resolving, Evaluated) :-\n    \t\\+ isComplementInBurdenOfProof(A),\n    \t\\+ notEvaluatedSuperiorOrEqualComplementArgument(Arguments, A, Resolving, _),\n    \t\\+ (\n            superiorOrEqualComplementArgument(A, X),\n            \\+ context_check(out(X))\n        ),\n        notEvaluatedSubArgument(Arguments, A, Resolving, B),\n        demonstration(Arguments, B, [B|Resolving], Evaluated).\n    demonstration(Arguments, A, Resolving, Evaluated) :-\n    \tbp_grounded::isArgumentInBurdenOfProof(A),\n    \tnotEvaluatedSuperiorOrEqualComplementArgument(Arguments, A, Resolving, B),\n        demonstration(Arguments, B, [B|Resolving], Evaluated).\n    demonstration(Arguments, A, Resolving, Evaluated) :-\n    \tbp_grounded::isArgumentInBurdenOfProof(A),\n    \tnotEvaluatedSubArgument(Arguments, A, Resolving, B),\n        demonstration(Arguments, B, [B|Resolving], Evaluated).\n    demonstration(Arguments, A, Resolving, Evaluated) :-\n    \t\\+ bp_grounded::isArgumentInBurdenOfProof(A),\n    \tnotEvaluatedSuperiorOrEqualComplementArgument(Arguments, A, Resolving, B),\n        demonstration(Arguments, B, [B|Resolving], Evaluated).\n    demonstration(Arguments, A, Resolving, Evaluated) :-\n    \t\\+ bp_grounded::isArgumentInBurdenOfProof(A),\n    \tnotEvaluatedSubArgument(Arguments, A, Resolving, B),\n        demonstration(Arguments, B, [B|Resolving], Evaluated).\n    /*\n        (c) A is labelled UND* otherwise.\n    */\n    demonstration(Arguments, A, Resolving, A) :-\n    \tdebug::writeDebug(['Adding argument: ', A, ' to UND* (2.c)']),\n        context_assert(und(A)).\n    isComplementInBurdenOfProof(A) :-\n        complement(A, Complement),\n        bp_grounded::isInBurdenOfProof(Complement), !.\n    mostGroundedArgument([], []).\n    mostGroundedArgument([X], X).\n    mostGroundedArgument([[L, _, _, _, _]|T], [L2, Q2, W2, B2, I2]) :-\n        mostGroundedArgument(T, [L2, Q2, W2, B2, I2]),\n        length(L, LN1),\n        length(L2, LN2),\n        LN1 > LN2, !.\n    mostGroundedArgument([A|_], A).\n    /*\n        Get a conclusion complement\n    */\n    complement([_, _, Conclusion, _, _], A) :-\n        standard_af::conflict(Conclusion, A).\n    notEvaluatedSubArgument(Arguments, A, Resolving, B) :-\n        context_check(support(B, A)),\n        member(B, Arguments),\n        \\+ member(B, Resolving).\n    notEvaluatedSuperiorComplementArgument(Arguments, A, Resolving, B) :-\n        superiorComplementArgument(A, B),\n        member(B, Arguments),\n        \\+ member(B, Resolving).\n    notEvaluatedSuperiorOrEqualComplementArgument(Arguments, A, Resolving, B) :-\n        superiorOrEqualComplementArgument(A, B),\n        member(B, Arguments),\n        \\+ member(B, Resolving).\n    superiorComplementArgument(A, [A, B, CA, BB, I]) :-\n        complement(A, CA),\n        context_check(argument([R, B, CA, BB, I])),\n        superiority::superiorArgument([R, B, CA, BB, I], A).\n    superiorOrEqualComplementArgument(A, [R, B, CA, BB, I]) :-\n        complement(A, CA),\n        context_check(argument([R, B, CA, BB, I])),\n        \\+ superiority::superiorArgument(A, [R, B, CA, BB, I]).\n        ");
  }
  BpGroundedPartial.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BpGroundedPartial',
    interfaces: []
  };
  var BpGroundedPartial_instance = null;
  function BpGroundedPartial_getInstance() {
    if (BpGroundedPartial_instance === null) {
      new BpGroundedPartial();
    }return BpGroundedPartial_instance;
  }
  function BpPartialComplete() {
    BpPartialComplete_instance = this;
    this.theoryCode = trimIndent("\n    argumentBPLabelling([Arguments, Attacks, _], [BPIN, BPOUT, BPUND]) :-\n        reifyBurdenOfProofs(Arguments, [], []),\n        once(filterBpDefeat(Attacks, FilteredAttacks)),\n        smartBpLabelling(Arguments, FilteredAttacks, [], [], [], BPIN, BPOUT, BPUND), !.\n    filterBpDefeat([], []).\n    filterBpDefeat([(T, B, A)|Attacks], FilteredAttacks) :-\n        (T = rebut; T = undermine),\n        isArgumentInBurdenOfProof(B),\n        attack(T, B, A, C),\n        \\+ superiorArgument(B, A, C),\n        filterBpDefeat(Attacks, FilteredAttacks).\n    filterBpDefeat([A|Attacks], [A|FilteredAttacks]) :-\n        filterBpDefeat(Attacks, FilteredAttacks).\n    smartBpLabelling(Arguments, Attacks, IN, OUT, UND, ResultIN, ResultOUT, ResultUND) :-\n        member(A, Arguments),\n        allAttacksOUT(Attacks, A, OUT),\n        subtract(Arguments, [A], NewArguments),\n        smartBpLabelling(NewArguments, Attacks, [A|IN], OUT, UND, ResultIN, ResultOUT, ResultUND).\n    smartBpLabelling(Arguments, Attacks, IN, OUT, UND, ResultIN, ResultOUT, ResultUND) :-\n        member(A, Arguments),\n        \\+ isArgumentInBurdenOfProof(A),\n        oneAttackIN(Attacks, A, IN),\n        subtract(Arguments, [A], NewArguments),\n        smartBpLabelling(NewArguments, Attacks, IN, [A|OUT], UND, ResultIN, ResultOUT, ResultUND).\n    smartBpLabelling(Arguments, Attacks, IN, OUT, UND, ResultIN, ResultOUT, ResultUND) :-\n        mostGroundedBpUnd(Arguments, Attacks, A),\n        subtract(Arguments, [A], NewArguments),\n        smartBpLabelling(NewArguments, Attacks, IN, [A|OUT], UND, ResultIN, ResultOUT, ResultUND).\n    smartBpLabelling(Arguments, _, IN, OUT, _, IN, OUT, Arguments).\n    mostGroundedBpUnd(Arguments, Attacks, Arg) :-\n        member(Arg, Arguments),\n        isArgumentInBurdenOfProof(Arg),\n        \\+ (\n            (member(A, Arguments), Arg \\= A, isArgumentInBurdenOfProof(A)),\n            argumentChain(A, Arg, Attacks)\n        ).\n    writeDemonstration([]) :-\n        demonstration,\n        write('\\n').\n    writeDemonstration([X|T]) :-\n        demonstration,\n        write(X),\n        writeDemonstration(T).\n    writeDemonstration(_).\n    argumentBPLabelling(COMPLETION ,[IN, OUT, UND], [BPIN, BPOUT, BPUND]) :-\n        reifyBurdenOfProofs(IN, OUT, UND),\n        writeDemonstration(['=========================================>DEMONSTRATION']),\n        argumentBPLabelling(COMPLETION, IN, OUT, UND, BPIN, BPOUT, BPUND),\n        writeDemonstration(['=====================================>END DEMONSTRATION']), !.\n    argumentBPLabelling(partial, IN, OUT, UND, BPIN, BPOUT, BPUND) :-\n        partialHBPLabelling(UND, IN, OUT, [], BPIN, BPOUT, BPUND).\n    argumentBPLabelling(complete, IN, OUT, UND, BPIN, BPOUT, BPUND) :-\n        hbpComplete(go, IN, OUT, UND, BPIN, BPOUT, BPUND).\n    hbpComplete(stop, IN, OUT, UND, IN, OUT, UND).\n    hbpComplete(_, IN, OUT, UND, BPIN, BPOUT, BPUND) :-\n        writeDemonstration(['======================================================>']),\n        partialHBPLabelling(UND, IN, OUT, [], BaseIN, BaseOUT, BaseUND),\n        completeLabelling(BaseIN, BaseOUT, BaseUND, CompleteIN, CompleteOUT, CompleteUND),\n        stopCondition(FLAG, IN, CompleteIN, OUT, CompleteOUT, UND, CompleteUND),\n        hbpComplete(FLAG, CompleteIN, CompleteOUT, CompleteUND, BPIN, BPOUT, BPUND).\n    stopCondition(X, IN, CIN, OUT, COUT, UND, CUND) :-\n        sort(IN, SIN),\n        sort(CIN, SCIN),\n        sort(OUT, SOUT),\n        sort(COUT, SCOUT),\n        sort(UND, SUND),\n        sort(CUND, SCUND),\n        stopCondition_sorted(X, SIN, SCIN, SOUT, SCOUT, SUND, SCUND).\n    stopCondition_sorted(stop, IN, IN, OUT, OUT, UND, UND).\n    stopCondition_sorted(go, _, _, _, _, _, _).\n    partialHBPLabelling([], IN_STAR, OUT_STAR, UND_STAR, IN_STAR, OUT_STAR, UND_STAR).\n    partialHBPLabelling(UND, IN_STAR, OUT_STAR, UND_STAR, ResultIN, ResultOUT, ResultUND) :-\n        more_grounded_argument(UND, A),\n        writeDemonstration(['Evaluating ', A]),\n        demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, [A], NewUnd, TempIN, TempOUT, TempUND),\n        partialHBPLabelling(NewUnd, TempIN, TempOUT, TempUND, ResultIN, ResultOUT, ResultUND).\n    /*\n        (a.i) BP(neg(\u03C6)), and no argument B for neg(\u03C6) such that A < B is IN*, and no A1,...An is OUT*\n    */\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, OUT_STAR, UND_STAR) :-\n    \tisComplementInBurdenOfProof(A),\n    \t\\+ findSupUndComplargument(A, UND, RESOLVING, _, _),\n    \tnoSuperiorComplementInSet(A, IN_STAR),\n    \t\\+ findUndSubargument(A, UND, RESOLVING, _, _),\n    \tnoSubArgumentInSet(A, OUT_STAR),\n    \twriteDemonstration(['Adding argument: ', A, ' to IN* (2.a.i)']),\n        append(IN_STAR, [A], TempIN),\n        subtract(UND, [A], NewUnd).\n    /*\n        (a.ii) not BP(neg(\u03C6)) and every argument B for neg(\u03C6) such that B(not <)A is OUT*, and every A1,...An is IN*\n    */\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, OUT_STAR, UND_STAR) :-\n    \t\\+ isComplementInBurdenOfProof(A),\n    \t\\+ findSupOrEqualUndComplargument(A, UND, RESOLVING, _, _),\n    \tallComplementInSet(A, OUT_STAR),\n    \t\\+ findUndSubargument(A, UND, RESOLVING, _, _),\n    \tallSubArgumentInSet(A, IN_STAR),\n    \twriteDemonstration(['Adding argument: ', A, ' to IN* (2.a.ii)']),\n        append(IN_STAR, [A], TempIN),\n        subtract(UND, [A], NewUnd).\n    /*\n        (b.i.1) BP(\u03C6) and exists an argument B for neg(\u03C6) such that B(not <)A is not OUT*\n    */\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, IN_STAR, TempOUT, UND_STAR) :-\n    \tisArgumentInBurdenOfProof(A),\n    \t\\+ findSupOrEqualUndComplargument(A, UND, RESOLVING, _, _),\n    \toneOutSuperiorOrEqualComplementFromSet(A, UND, OUT_STAR),\n        writeDemonstration(['Adding argument: ', A, ' to OUT* (2.b.i.1)']),\n        append(OUT_STAR, [A], TempOUT),\n        subtract(UND, [A], NewUnd).\n    /*\n        (b.i.2) BP(\u03C6) and exist one of A1,...An is not IN*\n    */\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, IN_STAR, TempOUT, UND_STAR) :-\n    \tisArgumentInBurdenOfProof(A),\n    \t\\+ findUndSubargument(A, UND, RESOLVING, _, _),\n    \toneOutSubArgumentFromSet(A, UND, IN_STAR),\n        writeDemonstration(['Adding argument: ', A, ' to OUT* (2.b.i.2)']),\n        append(OUT_STAR, [A], TempOUT),\n        subtract(UND, [A], NewUnd).\n    /*\n        (b.ii.1) not BP(\u03C6) and an argument B for neg(\u03C6) such A < B is IN*\n    */\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, IN_STAR, TempOUT, UND_STAR) :-\n    \t\\+ isArgumentInBurdenOfProof(A),\n    \t\\+ findSupUndComplargument(A, UND, RESOLVING, _, _),\n    \toneInSuperiorOrEqualComplementFromSet(A, IN_STAR),\n        writeDemonstration(['Adding argument: ', A, ' to OUT* (2.b.ii.1)']),\n        append(OUT_STAR, [A], TempOUT),\n        subtract(UND, [A], NewUnd).\n    /*\n        (b.ii.2) not BP(\u03C6) and one of A1,...An is OUT*\n    */\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, IN_STAR, TempOUT, UND_STAR) :-\n    \t\\+ isArgumentInBurdenOfProof(A),\n    \t\\+ findUndSubargument(A, UND, RESOLVING, _, _),\n    \toneInSubArgumentFromSet(A, OUT_STAR),\n        writeDemonstration(['Adding argument: ', A, ' to OUT* (2.b.ii.2)']),\n        append(OUT_STAR, [A], TempOUT),\n        subtract(UND, [A], NewUnd).\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, TempOUT, TempUND) :-\n        isComplementInBurdenOfProof(A),\n    \tfindSupUndComplargument(A, UND, RESOLVING, NR, Compl),\n        demonstration(Compl, UND, IN_STAR, OUT_STAR, UND_STAR, NR, NewUnd, TempIN, TempOUT, TempUND).\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, TempOUT, TempUND) :-\n    \tisComplementInBurdenOfProof(A),\n    \t\\+ findSupUndComplargument(A, UND, RESOLVING, _, _),\n    \tnoSuperiorComplementInSet(A, IN_STAR),\n        findUndSubargument(A, UND, RESOLVING, NR, Sub),\n        demonstration(Sub, UND, IN_STAR, OUT_STAR, UND_STAR, NR, NewUnd, TempIN, TempOUT, TempUND).\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, TempOUT, TempUND) :-\n        \\+ isComplementInBurdenOfProof(A),\n    \tfindAllUndComplargument(A, UND, RESOLVING, NR, Compl),\n        demonstration(Compl, UND, IN_STAR, OUT_STAR, UND_STAR, NR, NewUnd, TempIN, TempOUT, TempUND).\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, TempOUT, TempUND) :-\n    \t\\+ isComplementInBurdenOfProof(A),\n    \t\\+ findAllUndComplargument(A, UND, RESOLVING, _, _),\n    \tallComplementInSet(A, OUT_STAR),\n        findUndSubargument(A, UND, RESOLVING, NR, Sub),\n        demonstration(Sub, UND, IN_STAR, OUT_STAR, UND_STAR, NR, NewUnd, TempIN, TempOUT, TempUND).\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, TempOUT, TempUND) :-\n    \tisArgumentInBurdenOfProof(A),\n    \tfindSupOrEqualUndComplargument(A, UND, RESOLVING, NR, Compl),\n        demonstration(Compl, UND, IN_STAR, OUT_STAR, UND_STAR, NR, NewUnd, TempIN, TempOUT, TempUND).\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, TempOUT, TempUND) :-\n    \tisArgumentInBurdenOfProof(A),\n    \tfindUndSubargument(A, UND, RESOLVING, NR, Sub),\n        demonstration(Sub, UND, IN_STAR, OUT_STAR, UND_STAR, NR, NewUnd, TempIN, TempOUT, TempUND).\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, TempOUT, TempUND) :-\n    \t\\+ isArgumentInBurdenOfProof(A),\n    \tfindSupOrEqualUndComplargument(A, UND, RESOLVING, NR, Compl),\n        demonstration(Compl, UND, IN_STAR, OUT_STAR, UND_STAR, NR, NewUnd, TempIN, TempOUT, TempUND).\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, RESOLVING, NewUnd, TempIN, TempOUT, TempUND) :-\n    \t\\+ isArgumentInBurdenOfProof(A),\n    \tfindUndSubargument(A, UND, RESOLVING, NR, Sub),\n        demonstration(Sub, UND, IN_STAR, OUT_STAR, UND_STAR, NR, NewUnd, TempIN, TempOUT, TempUND).\n    /*\n        (c) A is labelled UND* otherwise.\n    */\n    demonstration(A, UND, IN_STAR, OUT_STAR, UND_STAR, _, NewUnd, IN_STAR, OUT_STAR, TempUND) :-\n    \twriteDemonstration(['Adding argument: ', A, ' to UND* (2.c)']),\n        append(UND_STAR, [A], TempUND),\n        subtract(UND, [A], NewUnd).\n    /*\n        Load dependencies\n    */\n    findUndSubargument(A, UND, RESOLVING, NEW_RESOLVING, Sub) :-\n        support(Sub, A),\n        member(Sub, UND),\n        \\+ member(Sub, RESOLVING),\n        append(RESOLVING, [Sub], NEW_RESOLVING).\n    findAllUndComplargument(A, UND, RESOLVING, NEW_RESOLVING, Compl) :-\n        allComplArguments(A, List),\n        findAcceptable(A, List, UND, RESOLVING, NEW_RESOLVING, Compl).\n    findSupUndComplargument(A, UND, RESOLVING, NEW_RESOLVING, Compl) :-\n        superiorComplArguments(A, List),\n        findAcceptable(A, List, UND, RESOLVING, NEW_RESOLVING, Compl).\n    findSupOrEqualUndComplargument(A, UND, RESOLVING, NEW_RESOLVING, Compl) :-\n        superiorOrEqualComplArguments(A, List),\n        findAcceptable(A, List, UND, RESOLVING, NEW_RESOLVING, Compl).\n    findAcceptable(A, List, UND, RESOLVING, NEW_RESOLVING, Compl) :-\n        member(Compl, List),\n        member(Compl, UND),\n        \\+ member(Compl, RESOLVING),\n        append(RESOLVING, [Compl], NEW_RESOLVING).\n    /*\n        Conditions\n    */\n    noSuperiorComplementInSet(Argument, Set) :-\n        superiorComplArguments(Argument, LIST),\n        noInWithEmptyCheck(LIST, Set).\n    noSubArgumentInSet(Argument, Set) :-\n        allDirectsSubArguments(Argument, LIST),\n        noInWithEmptyCheck(LIST, Set).\n    allComplementInSet(Argument, Set) :-\n        allComplArguments(Argument, LIST),\n        allInWithEmptyCheck(LIST, Set).\n    allSubArgumentInSet(Argument, Set) :-\n        allDirectsSubArguments(Argument, LIST),\n        allInWithEmptyCheck(LIST, Set).\n    oneOutSuperiorOrEqualComplementFromSet(Argument, UND, Set) :-\n        superiorOrEqualComplArguments(Argument, LIST),\n        oneOut(LIST, UND, Set).\n    oneOutSubArgumentFromSet(Argument, UND, Set) :-\n        allDirectsSubArguments(Argument, LIST),\n        oneOut(LIST, UND, Set).\n    oneInSuperiorOrEqualComplementFromSet(Argument, Set) :-\n        superiorOrEqualComplArguments(Argument, LIST),\n        oneIn(LIST, Set).\n    oneInSubArgumentFromSet(Argument, Set) :-\n        allDirectsSubArguments(Argument, LIST),\n        oneIn(LIST, Set).\n    /*\n        Support\n    */\n    allDirectsSubArguments(Argument, LIST) :-\n        findall(Sub, support(Sub, Argument), LIST).\n    allComplArguments(Argument, LIST) :-\n        findall(X, (\n            complement(Argument, CA),\n            findall([A, B, CA], argument([A, B, CA]), X)\n        ), Y),\n        appendLists(Y, LIST).\n    superiorComplArguments(Argument, LIST) :-\n        findall(X, (\n            complement(Argument, CA),\n            findall([A, B, CA], (argument([A, B, CA]), superiorArgument([A, B, CA], Argument)), X)\n        ), Y),\n        appendLists(Y, LIST).\n    superiorOrEqualComplArguments(Argument, LIST) :-\n        findall(X, (\n            complement(Argument, CA),\n            findall([A, B, CA], (argument([A, B, CA]), \\+ superiorArgument(Argument, [A, B, CA])), X)\n        ), Y),\n        appendLists(Y, LIST).\n    noInWithEmptyCheck([], _).\n    noInWithEmptyCheck(List, Target) :- noIn(List, Target).\n    noIn(List, Target) :-\n        member(X, List),\n        \\+ member(X, Target).\n    allInWithEmptyCheck([], _).\n    allInWithEmptyCheck(List, Target) :- allIn(List, Target).\n    allIn(List, Target) :-\n        member(_, List),\n        \\+ (member(Y, List), \\+ member(Y, Target)).\n    oneInWithEmptyCheck([], _).\n    oneInWithEmptyCheck(List, Target) :- oneIn(List, Target).\n    oneIn(List, Target) :-\n        member(X, List),\n        member(X, Target).\n    oneOutWithEmptyCheck([], _, _).\n    oneOutWithEmptyCheck(List, UND, Target) :- oneOut(List, UND, Target).\n    oneOut(List, UND, Target) :-\n        member(X, List),\n        \\+ member(X, UND),\n        \\+ member(X, Target).\n    completeLabelling(IN, OUT, UND, ResultIN, ResultOUT, ResultUND) :-\n        findoneIn(IN, OUT, UND, A),\n        writeDemonstration(['Adding argument: ', A, ' to IN* (4.4)']),\n        append(IN, [A], NewIN),\n        subtract(UND, [A], NewUnd),\n        completeLabelling(NewIN, OUT, NewUnd, ResultIN, ResultOUT, ResultUND).\n    completeLabelling(IN, OUT, UND, ResultIN, ResultOUT, ResultUND) :-\n        findoneOut(IN, OUT, UND, A),\n        writeDemonstration(['Adding argument: ', A, ' to OUT* (4.4)']),\n        append(OUT, [A], NewOUT),\n        subtract(UND, [A], NewUnd),\n        completeLabelling(IN, NewOUT, NewUnd, ResultIN, ResultOUT, ResultUND).\n    completeLabelling(IN, OUT, UND, IN, OUT, UND).\n    findoneIn(IN, OUT, UND, A):-\n        member(A, UND),\n        completeIn(A, IN, OUT).\n    findoneOut(IN, OUT, UND, A):-\n        member(A, UND),\n        completeOut(A, IN, OUT).\n    completeIn(A, _, OUT) :- checkOutAttackers(A, OUT).\n    /*\n        If an attack exists, it should come from an OUT argument\n    */\n    checkOutAttackers(A, OUT) :-\n        \\+ ( attack(_, B, A), \\+ ( member(B, OUT)) ).\n    completeOut(A, IN, _) :- checkInAttacker(A, IN).\n    completeOut(A, IN, _) :- checkInAttecked(A, IN).\n    /*\n        Find an attack, if exists, from an IN argument, then ends\n    */\n    checkInAttacker(A, IN) :-\n        attack(_, B, A),\n        member(B, IN), !.\n    /*\n        If A attacks an IN argument, then A is OUT\n    */\n    checkInAttecked(A, IN) :-\n        attack(_, A, B),\n        member(B, IN), !.\n    /*\n        Checks Burden of proof membership\n    */\n    isInBurdenOfProof(Concl) :-\n        reifiedBp(Literals),\n        member(Concl, Literals), !.\n    isComplementInBurdenOfProof(A) :-\n        complement(A, Compl),\n        isInBurdenOfProof(Compl), !.\n    isArgumentInBurdenOfProof([_, _, Concl]) :-\n        isInBurdenOfProof(Concl).\n    more_grounded_argument([], []).\n    more_grounded_argument([X], X).\n    more_grounded_argument([[L,_,_]|T], [L2,Q2,W2]) :-\n        more_grounded_argument(T, [L2,Q2,W2]),\n        length(L, LN1),\n        length(L2, LN2),\n        LN1 > LN2.\n    more_grounded_argument([[L,Q,W]|_], [L,Q,W]).\n    /*\n        Get a conclusion complement\n    */\n    complement([_, _, Conc], A) :- conflict(Conc, A).\n    reifyBurdenOfProofs(IN, OUT, UND) :-\n        extractConclusions(IN, OUT, UND, Conclusions),\n        computeBp(Conclusions).\n    extractConclusions(IN, OUT, UND, SL) :-\n        findall(Conc, member([_, _, Conc], IN), In),\n        findall(Conc, member([_, _, Conc], OUT), Out),\n        findall(Conc, member([_, _, Conc], UND), Und),\n        appendLists([In, Out, Und], L),\n        sort(L, SL).\n    computeBp(Conclusions) :-\n        abstractBp(AbstractBp),\n        fillTemplate(AbstractBp, Conclusions, R),\n        \\+ reifiedBp(R),\n        asserta(reifiedBp(R)),\n        computeBp(Conclusions).\n    computeBp(_).\n    /*\n        Fill the template (first parameter) using predicates belonging\n        to the second list (second parameter)\n    */\n    fillTemplate([], _, []).\n    fillTemplate([H|T], C, [H|R]) :- member(H, C), fillTemplate(T, C, R).\n        ");
  }
  BpPartialComplete.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'BpPartialComplete',
    interfaces: []
  };
  var BpPartialComplete_instance = null;
  function BpPartialComplete_getInstance() {
    if (BpPartialComplete_instance === null) {
      new BpPartialComplete();
    }return BpPartialComplete_instance;
  }
  function Complete() {
    Complete_instance = this;
    this.theoryCode = trimIndent('\n    argumentLabelling :-\n        cache_retract(complete(_,_,_)),\n        grounded:::argumentLabelling,\n        context_active(Branch),\n        completeLabelling(Branch).\n    completeLabelling(_) :-\n        admissibleSet,\n        utils::recoverArgumentLabelling(In, Out, Und),\n        \\+ cache_check(complete(In, Out, Und)),\n        cache_assert(complete(In, Out, Und)).\n    completeLabelling(Branch) :-\n        context_check(und(X)),\n        context_branch(Branch, NewBranch),\n        findall(Y, (context_check(und(Y)), Y \\= X), Arguments),\n        context_retract(und(_)),\n        context_assert(in(X)),\n        grounded::groundedLabelling(Arguments),\n        completeLabelling(NewBranch).\n    admissibleSet :-\n        \\+ (context_check(in(H)), \\+ admissible(H)).\n    admissible(H) :-\n        \\+ (\n            context_check(attack(_, Attacker, H, _)),\n            \\+ (\n                context_check(attack(_, Defendant, Attacker, _)),\n                context_check(in(Defendant))\n            )\n        ).\n        ');
  }
  Complete.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Complete',
    interfaces: []
  };
  var Complete_instance = null;
  function Complete_getInstance() {
    if (Complete_instance === null) {
      new Complete();
    }return Complete_instance;
  }
  function Debug() {
    Debug_instance = this;
    this.theoryCode = trimIndent("\n    printTheory(Rules) :-\n        write('HERE THE THEORY:'),nl,\n        findall(rule([Id, Body, Head]), member(rule([Id, Body, Head]), Rules), ListRules),\n        utils::writeListNl(ListRules),\n        findall(premise([A, B]), member(premise([A, B]), Rules), ListPremises),\n        utils::writeListNl(ListPremises),\n        findall(sup(A, B), member(sup(A, B), Rules), ListSups),\n        utils::writeListNl(ListSups).\n    printArgumentationGraph(Arguments, Attacks, Supports) :-\n    \tfindall(\n    \t    [IDPremises, '\\n',  ' TOPRULE ',  TopRule, '\\n', ' CONCLUSION ', RuleHead, '\\n', ' BODY ', Body, '\\n', ' INFO ', Info, '\\n'],\n    \t    member([IDPremises, TopRule, RuleHead, Body, Info], Arguments),\n            ArgumentsToPrint\n        ),\n        findall((A1, ' SUPPORTS ', A2), member((A1, A2), Supports), SupportsToPrint),\n    \tfindall((A1, ' ', T, ' ', A2, ' ON ', A3),  member((T, A1, A2, A3), Attacks),  AttacksToPrint),\n        write('HERE THE GROUNDED SEMI-ABSTRACT ARGUMENTATION GRAPH'),nl,\n    \tutils::writeListNl(ArgumentsToPrint),\n    \tutils::writeListNl(SupportsToPrint),\n    \tutils::writeListNl(AttacksToPrint).\n    printArgumentLabelling([IN, OUT, UND]) :-\n        write('HERE THE ARGUMENTS LABELLED IN: '),nl,\n        utils::writeListNl(IN),\n        write('HERE THE ARGUMENTS LABELLED OUT: '),nl,\n        utils::writeListNl(OUT),\n        write('HERE THE ARGUMENTS LABELLED UND: '),nl,\n        utils::writeListNl(UND).\n    printStatementLabelling([In, Ni, Und]) :-\n        write('HERE THE STATEMENTS LABELLED IN: '),nl,\n        utils::writeListNl(In),\n        write('HERE THE STATEMENTS LABELLED NI: '),nl,\n        utils::writeListNl(Ni),\n        write('HERE THE STATEMENTS LABELLED UND: '),nl,\n        utils::writeListNl(Und).\n    debug.\n    writeDebug(List) :-\n        debug,\n        utils::writeList(List).\n    writeDebug(_) :- \\+ debug.\n        ");
  }
  Debug.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Debug',
    interfaces: []
  };
  var Debug_instance = null;
  function Debug_getInstance() {
    if (Debug_instance === null) {
      new Debug();
    }return Debug_instance;
  }
  function DefPreferences() {
    DefPreferences_instance = this;
    this.theoryCode = trimIndent('\n    modifyArgumentationGraph :-\n        assertAllSup,\n        findall((T, A, B, C), context_check(attack(T, A, B, C)), Attacks),\n        filterSupRelatedAttacks(Attacks, InvalidAttacks),\n        convertAttacks(InvalidAttacks),\n        buildPrefAttacks.\n    assertAllSup :-\n        context_retract(sup(_, _)),\n        findall(_,\n            (\n                context_check(argument([_, _, [sup(RuleOne, RuleTwo)], _, _])),\n                \\+ context_check(sup(RuleOne, RuleTwo)),\n                context_assert(sup(RuleOne, RuleTwo))\n            ),\n        _).\n    filterSupRelatedAttacks([], []).\n    filterSupRelatedAttacks([(T, A, B, C)|Attacks], [(T, A, B, C)|Invalid]) :-\n        invalid(T, A, B, C, _),\n        filterSupRelatedAttacks(Attacks, Invalid), !.\n    filterSupRelatedAttacks([_|Attacks], Invalid) :-\n        filterSupRelatedAttacks(Attacks, Invalid).\n    invalid(rebut, A, B, C, SupSet) :- superiority::superiorArgument(C, A, SupSet), !.\n    invalid(undermine, A, B, C, SupSet) :- superiority::superiorArgument(C, A, SupSet), !.\n    /*\n    *   Translates the attack relations identified during the building phase.\n    *   Attack from A to B -> Argument [[], attack, Attack]\n    *                         support(A, Argument)\n    *                         attack(Argument, B)\n    *   If an Argument A built in this way attacks the argument B, and this one also attacks a third argument C\n    *   through the argument B1 we have to consider an attack from A to B1 (transitive attack)\n    */\n    convertAttacks(Attacks) :-\n        conversion(Attacks),\n        standard_af::buildTransitiveAttacks.\n    conversion(List) :-\n        member((T, A, B, B), List),\n        generateDirectAttackArgument(T, A, B, B),\n        fail.\n    conversion(List) :-\n        member((T, A, B, C), List),\n        C \\= B,\n        generateTransitiveAttackArgument(T, A, B, C),\n        fail.\n    conversion(_).\n    generateTransitiveAttackArgument(T, A, B, C) :-\n        context_check(argument([Id, attack, [attack(T, A, C, C)], G, I])),\n        context_assert(attack(T, [Id, attack, [attack(T, A, C, C)], G, I], B, C)),\n        context_retract(attack(T, A, B, C)).\n    generateDirectAttackArgument(T, A, B, B) :-\n        RArgument = [[attack], attack, [attack(T, A, B, B)], [], [[attack], [attack], []]],\n        \\+ context_check(argument(RArgument)),\n        context_assert(argument(RArgument)),\n        context_assert(support(A, RArgument)),\n        context_assert(attack(T, RArgument, B, B)),\n        context_retract(attack(T, A, B, B)).\n    /*\n    *   Computes the pref attack. If an Argument A has a conclusion in the form sup(a, b), we verify if\n    *   the attacks involving arguments built on the rules a or b are compatible with this preference.\n    *   If there are some contradictions we add an attack from the argument A towards the incompatible attack\n    */\n    buildPrefAttacks :-\n        context_check(argument([IdB, attack, [attack(T, A, B, C)], G, I])),\n        invalid(T, A, B, C, SupSet),\n        member(X, SupSet),\n        context_check(argument([IdA, TRA, [X], GG, II])),\n        Attack = attack(pref, [IdA, TRA, [X], GG, II], [IdB, attack, [attack(T, A, B, C)], G, I], [IdB, attack, [attack(T, A, B, C)], G, I]),\n        \\+ context_check(Attack),\n        context_assert(Attack),\n        fail.\n    buildPrefAttacks.\n        ');
  }
  DefPreferences.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'DefPreferences',
    interfaces: []
  };
  var DefPreferences_instance = null;
  function DefPreferences_getInstance() {
    if (DefPreferences_instance === null) {
      new DefPreferences();
    }return DefPreferences_instance;
  }
  function GenericDefPreferences() {
    GenericDefPreferences_instance = this;
    this.theoryCode = trimIndent('\n    modifyArgumentationGraph :-\n        defeasiblePref::assertAllSup,\n        findall((T, A, B, C), context_check(attack(T, A, B, C)), Attacks),\n        defeasiblePref::filterSupRelatedAttacks(Attacks, InvalidAttacks),\n        defeasiblePref::convertAttacks(InvalidAttacks),\n        buildPrefAttacks,\n        standard_af::buildTransitiveAttacks.\n    buildPrefAttacks :-\n        context_check(argument([IdB, attack, [attack(T, A, B, C)], G, I])),\n        defeasiblePref::invalid(T, A, B, C, SupSet),\n        createSuperiorityArgument(SupSet, Arg),\n        write(Arg), nl,\n        Attack = attack(pref, Arg, [IdB, attack, [attack(T, A, B, C)], G, I], [IdB, attack, [attack(T, A, B, C)], G, I]),\n        \\+ context_check(Attack),\n        context_assert(Attack),\n        fail.\n    buildPrefAttacks.\n    createSuperiorityArgument(SupSet, Argument) :-\n        findall([Id, TR, [X], G, I], (\n            member(X, SupSet),\n            context_check(argument([Id, TR, [X], G, I]))\n        ), SupportArguments),\n        mergeIds(SupportArguments, MergedId),\n        Argument = [MergedId, pref, [mergedPreference], [], [[pref], MergedId, []]],\n        \\+ context_check(argument(Argument)),\n        context_assert(argument(Argument)),\n        findall(_, (\n            member(A, SupportArguments),\n            \\+ context_check(support(A, Argument)),\n            context_assert(support(A, Argument))\n        ), _).\n    mergeIds([], [pref]).\n    mergeIds(Arguments, [pref|MergedId]) :-\n        findall(Id, member([Id, _, _, _, _], Arguments), Res),\n        utils::appendLists(Res, MergedId).\n        ');
  }
  GenericDefPreferences.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'GenericDefPreferences',
    interfaces: []
  };
  var GenericDefPreferences_instance = null;
  function GenericDefPreferences_getInstance() {
    if (GenericDefPreferences_instance === null) {
      new GenericDefPreferences();
    }return GenericDefPreferences_instance;
  }
  function Grounded() {
    Grounded_instance = this;
    this.theoryCode = trimIndent('\n    argumentLabelling :-\n        findall(X, context_check(argument(X)), Arguments),\n        groundedLabelling(Arguments).\n    groundedLabelling(UND) :-\n        member(A, UND), \n        allAttacksOUT(A), !,\n        utils::subtract(UND, [A], NewUND),\n        context_assert(in(A)),\n        groundedLabelling(NewUND).\n    groundedLabelling(UND) :-\n        member(A, UND),\n        oneAttackIN(A), !,\n        utils::subtract(UND, [A], NewUND),\n        context_assert(out(A)),\n        groundedLabelling(NewUND).\n    groundedLabelling(Args) :- findall(_, (member(A, Args), context_assert(und(A))), _).\n    allAttacksOUT(A) :-\n        \\+ ( context_check(attack(_, B, A, _)), \\+ (context_check(out(B)))).\n    oneAttackIN(A) :-\n        context_check(attack(_, B, A, _)),\n        context_check(in(B)), !.\n    oneAttackIN(A) :-\n        context_check(attack(_, A, B, _)),\n        context_check(in(B)), !.\n        ');
  }
  Grounded.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Grounded',
    interfaces: []
  };
  var Grounded_instance = null;
  function Grounded_getInstance() {
    if (Grounded_instance === null) {
      new Grounded();
    }return Grounded_instance;
  }
  function Preferences() {
    Preferences_instance = this;
    this.theoryCode = trimIndent('\n    modifyArgumentationGraph :-\n        findall(_, (\n            context_check(attack(T, A, B, C)),\n            checkStandardPreference(T, A, B, C)\n        ), _).\n    checkStandardPreference(T, A, B, C) :-\n        \\+ standardPreferences(T, A, B, C),\n        context_retract(attack(T, A, B, C)).\n    standardPreferences(rebut, A, _, C) :- \\+ superiority::superiorArgument(C, A).\n    standardPreferences(undermine, A, _, C) :- \\+ superiority::superiorArgument(C, A).\n    standardPreferences(contrary_rebut, _, _, _).\n    standardPreferences(contrary_undermine, _, _, _).\n    standardPreferences(undercut, _, _, _).\n        ');
  }
  Preferences.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Preferences',
    interfaces: []
  };
  var Preferences_instance = null;
  function Preferences_getInstance() {
    if (Preferences_instance === null) {
      new Preferences();
    }return Preferences_instance;
  }
  function QueryMode_0() {
    QueryMode_instance_0 = this;
    this.theoryCode = trimIndent('\n    computeStatementAcceptance(Goal, YesResult, NoResult, UndResult) :-\n        \\+ queryMode,\n        abstract:::computeGlobalAcceptance,\n        mineResults(Goal, YesResult, NoResult, UndResult).\n    computeStatementAcceptance(Goal, YesResult, NoResult, UndResult) :-\n        queryMode,\n        argumentLabellingMode(grounded),\n        parser::check_modifiers_in_list(effects, [Goal], [X]),\n        findall(_, query(X, _), _),\n        statementLabellingMode(Y),\n        Y:::statementLabelling,\n        mineResults(Goal, YesResult, NoResult, UndResult).\n    mineResults(Goal, YesResult, NoResult, UndResult) :-\n        parser::check_modifiers_in_list(effects, [Goal], [X]),\n        findall(Goal, context_check(statIn(X)), In),\n        findall(Goal, context_check(statOut(X)), Out),\n        findall(Goal, context_check(statUnd(X)), Und),\n        utils::sort(In, YesResult),\n        utils::sort(Out, NoResult),\n        utils::sort(Und, UndResult).\n    query(Query, Res) :-\n        buildArgument(Query, Argument),\n        once(defend(Argument, [], Res)).\n    query(Query, und) :- \\+ buildArgument(Query, _).\n    defend(Argument, _, no) :- context_check(out(Argument)).\n    defend(Argument, _, und) :- context_check(und(Argument)).\n    defend(Argument, _, yes) :- context_check(in(Argument)).\n    defend(Argument, QueryChain, no) :-\n        findAttacker(Argument, QueryChain, Attacker, yes),\n        once(defend(Attacker, [Argument|QueryChain], X)),\n        X == yes,\n        bufferResult(Argument, no), !.\n    defend(Argument, QueryChain, und) :-\n        findAttacker(Argument, QueryChain, Attacker, no),\n        bufferResult(Argument, und), !.\n    defend(Argument, QueryChain, und) :-\n        findAttacker(Argument, QueryChain, Attacker, yes),\n        once(defend(Attacker, [Argument|QueryChain], X)),\n        X == und,\n        bufferResult(Argument, und), !.\n    defend(Argument, QueryChain, yes) :- bufferResult(Argument, yes).\n    bufferResult(Argument, no) :- \\+ context_check(out(Argument)), context_assert(out(Argument)), !.\n    bufferResult(Argument, yes) :- \\+ context_check(in(Argument)), context_assert(in(Argument)), !.\n    bufferResult(Argument, und) :- \\+ context_check(und(Argument)), context_assert(und(Argument)), !.\n    bufferResult(_, _).\n    findAttacker(Target, QueryChain, Attacker, IsValid) :-\n        attacker(Target, Attacker),\n        bufferAttacker(Attacker, Target),\n        detectCycle(Attacker, QueryChain, IsValid).\n    bufferAttacker(Attacker, Target) :-\n        \\+ context_check(attack(none, Attacker, Target, none)),\n        context_assert(attack(none, Attacker, Target, none)), !.\n    bufferAttacker(_, _).\n    detectCycle(Attacker, QueryChain, yes) :- \\+ member(Attacker, QueryChain).\n    detectCycle(Attacker, QueryChain, no) :- member(Attacker, QueryChain).\n    attacker([Rules, TopRule, Conclusion, Groundings, ArgInfo], Argument) :-\n        member(X, Rules),\n        \\+ context_check(strict(X)),\n        attackerOnRule(X, [Rules, TopRule, Conclusion, Groundings, ArgInfo], Argument).\n    attacker([Rules, TopRule, Conclusion, Groundings, ArgInfo], Argument) :-\n        member(X, Groundings),\n        attackerOnTerm(X, [Rules, TopRule, Conclusion, Groundings, ArgInfo], Argument).\n    attackerOnRule(Rule, _, Argument) :-\n        buildArgument([undercut(Rule)], Argument).\n    attackerOnTerm(Term, [TargetRules, TopRule, Conclusion, Groundings, ArgInfo], Attacker) :-\n        Term \\= [unless, _],\n        \\+ strict([TargetRules, TopRule, Conclusion, Groundings, ArgInfo]),\n        buildSubArgument(Term, TargetRules, SubArgument),\n        rebutRestriction(SubArgument),\n        standard_af::conflict(Term, X),\n        buildArgument(X, Attacker),\n        \\+ superiorArgument(SubArgument, Attacker).\n    attackerOnTerm([unless, X], _, Attacker) :-\n        buildArgument(X, Attacker).\n    strict([_, _, _, _, [_, [], []]]).\n    rebutRestriction([TargetRules, none, Conclusion, Groundings, ArgInfo]) :-\n        graphExtension(rebutRestriction).\n    rebutRestriction([TargetRules, TopRule, Conclusion, Groundings, ArgInfo]) :-\n        graphExtension(rebutRestriction),\n        TopRule \\= none,\n        rebutRestriction::restrict([TargetRules, TopRule, Conclusion, Groundings, ArgInfo]).\n    rebutRestriction(_) :- \\+ graphExtension(rebutRestriction).\n    superiorArgument(SubArgument, Attacker) :-\n        superiority::superiorArgument(SubArgument, Attacker).\n    buildSubArgument(Term, Rules, [SubRules, SubTopRule, SubConclusion, SubGrounds, Info]) :-\n        buildArgument(Term, [SubRules, SubTopRule, SubConclusion, SubGrounds, Info]),\n        contained(SubRules, Rules).\n    contained([], _).\n    contained([H|T], Target) :- member(H, Target), contained(T, Target).\n    buildArgument(Query, Argument) :-\n        \\+ context_check(explored(Query)),\n        findall(_, (\n            buildSingleArgument(Query, Argument),\n            context_assert(argument(Argument))\n        ), _),\n        context_assert(explored(Query)),\n        fail.\n    buildArgument(Query, [R, T, Query, B, I]) :- context_check(argument([R, T, Query, B, I])).\n    buildSingleArgument(Query, Argument) :-\n        build(Query, Groundings, [AllRules, TopRule, LastDefRules, DefRules, DefPremises]),\n        utils::deduplicate(DefRules, CDefRules),\n        utils::deduplicate(DefPremises, CDefPremises),\n        utils::deduplicate(Groundings, CGroundings),\n        Argument = [AllRules, TopRule, Query, CGroundings, [LastDefRules, CDefRules, CDefPremises]].\n    build(Conclusion, [Conclusion], Rules) :-\n        context_check(premise([Id, Conclusion])),\n        premiseRules(Id, Rules).\n    build(Conclusion, [Conclusion|Conclusions], Rules) :-\n        context_check(rule([Id, Premises, Conclusion])),\n        buildPremises(Premises, Conclusions, ResRules),\n        ruleRules(Id, ResRules, Rules).\n    build([prolog(Check)], [], []) :- (callable(Check) -> call(Check); Check).\n    build([unless, Atom], [[unless, Atom]], []).\n    buildPremises([], [], [[], [], [], []]).\n    buildPremises([H|T], Conclusions, Rules) :-\n        build(H, HConclusions, HRules),\n        buildPremises(T, TConclusions, TRules),\n        utils::appendLists([HConclusions, TConclusions], Conclusions),\n        mergeRules(HRules, TRules, Rules).\n    premiseRules(Id, [[Id], none, [], [], [Id]]) :- \\+ context_check(strict(Id)).\n    premiseRules(Id, [[Id], none, [], [], []]) :- context_check(strict(Id)).\n    ruleRules(Id, [AllRules, _, DefRules, DefPremises], \n        [[Id|AllRules], Id, [Id], [Id|DefRules], DefPremises]) :- \\+ context_check(strict(Id)).\n    ruleRules(Id, [AllRules, LastDefRules, DefRules, DefPremises], \n        [[Id|AllRules], Id, LastDefRules, DefRules, DefPremises]) :- context_check(strict(Id)).\n    mergeRules([], [AllRules, LastDefRules, DefRules, DefPremises], [AllRules, LastDefRules, DefRules, DefPremises]).\n    mergeRules([HAR, _, HLDR, HDR, HDP], [TAR, TLDR, TDR, TDP], [AR, LDR, DR, DP]) :-\n       utils::appendLists([HAR, TAR], AR),\n       utils::appendLists([HLDR, TLDR], LDR),\n       utils::appendLists([HDR, TDR], DR),\n       utils::appendLists([HDP, TDP], DP).\n        ');
  }
  QueryMode_0.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'QueryMode',
    interfaces: []
  };
  var QueryMode_instance_0 = null;
  function QueryMode_getInstance_0() {
    if (QueryMode_instance_0 === null) {
      new QueryMode_0();
    }return QueryMode_instance_0;
  }
  function RuleTranslator() {
    RuleTranslator_instance = this;
    this.theoryCode = trimIndent("\n    /*\n     *  Main directive. Find all the rules in the theory in the format (Name : Preconditions => Conclusion)\n     *  or (Name : Effects) and then if:\n     *  - It is a standard rule, translate it in the standard format (rule([Name, Preconditions, Conclusions]));\n     *  - It is a bp rule, translate it to (abstractBp([Effects]))\n     *  During the process, clean them from the unallowed symbols (-, o, p).\n     */\n    convertAllRules(ArgRules) :-\n        defeasibleRules(DefeasibleRules),\n        strictRules(StrictRules, RulesIds),\n        ordinaryPremises(Premises),\n        axiomPremises(Axioms, AxiomsIds),\n        specialRules(SpecialRules),\n        utils::appendLists([DefeasibleRules, StrictRules, Premises, Axioms, SpecialRules], L),\n        convertAllRules(L, Rules), !,\n        findall(sup(X, Y), sup(X, Y), Sups),\n        utils::appendLists([Rules, AxiomsIds, RulesIds, Sups], ArgRules),\n        findall(_, (member(X, ArgRules), context_assert(X)), _).\n    defeasibleRules(DefeasibleRules) :-\n        findall([RuleName, Preconditions, Effect], (RuleName : Preconditions => Effect), DefeasibleRulesOld),\n        prologDefeasibleRules(DefeasibleRulesNew),\n        append(DefeasibleRulesOld, DefeasibleRulesNew, DefeasibleRules).\n    strictRules(CtrRules, Ids) :-\n        findall([RuleName, Preconditions, Effect], (RuleName : Preconditions -> Effect), StrictRulesOld),\n        prologStrictRules(StrictRulesNew),\n        append(StrictRulesOld, StrictRulesNew, StrictRules),\n        transpose(StrictRules, StrictRules, CtrRules),\n        findall(strict(RN), member([RN, _, _], CtrRules), Ids).\n    ordinaryPremises(Premises) :-\n        findall([RuleName, Effect], ((RuleName :=> Effect), atom(RuleName)), PremisesOld),\n        prologPremises(PremisesNew),\n        append(PremisesOld, PremisesNew, Premises).\n    axiomPremises(Axioms, Ids) :-\n        findall([RuleName, Effect], ((RuleName :-> Effect), atom(RuleName)), AxiomsOld),\n        prologAxioms(AxiomsNew),\n        append(AxiomsOld, AxiomsNew, Axioms),\n        findall(strict(RN), member([RN, _], Axioms), Ids).\n    specialRules(SpecialRules) :-\n        bpsNew(SpecialRules).\n    transpose(_, CtrRules, CtrRules) :- \\+ autoTransposition. \n    transpose([], CtrRules, CtrRules).\n    transpose([H|T], TempCtrRules, CtrRules) :-\n        transpose(T, TempCtrRules, CR),\n        findall(TrH, transposition(H, TrH), Tran),\n        mergeCtrRules(CR, Tran, CtrRules).\n    mergeCtrRules(All, ToMerge, X) :-\n        append(All, ToMerge, XT),\n        deduplicate(XT, X).\n    deduplicate([], []).\n    deduplicate([[RN,A,B]|T], X) :- deduplicate(T, TT), (member([RN,_,_], TT) -> X = TT; X = [[RN,A,B]|TT]). \n    transposition([Id, Prec, Effect], [Id, Prec, Effect]).\n    transposition([Id, Prec, Effect], [NewId, NewPrec ,XNegated]) :-\n        compound(Prec),\n        tuple_to_list(Prec, LPrec),!,\n        transposition_sequential(LPrec, LPrec, Effect, Id, [], NewPrec, XNegated, NewId).\n    transposition([Id, Prec, Effect], [NewId, EffectNegated ,XNegated]) :-\n        \\+ compound(Prec),\n        Prec \\== [],\n        prologEscape(Prec),\n        negate(Prec, XNegated),\n        negate(Effect, EffectNegated),\n        atom_concat(Id, '_i', NewId).\n    transposition_sequential(LPrec, [H|T], Effect, Id, Skipped, NewPrec, XNegated, NewId) :-\n        transposition_sequential(LPrec, T, Effect, Id, [H|Skipped], NewPrec, XNegated, NewId).\n    transposition_sequential(LPrec, [X|T], Effect, Id, Skipped, NewPrec, XNegated, NewId) :-\n        prologEscape(X),\n        append(Skipped, T, CleanedPrec),\n        negate(X, XNegated),\n        negate(Effect, EffectNegated),\n        list_to_tuple([EffectNegated|CleanedPrec], NewPrec),\n        newIdentifier(Skipped, Id, NewId).\n    newIdentifier(List, OldId, NewId) :-\n        modifier(List, Mod),\n        atom_concat(OldId, Mod, NewId).\n    modifier([], '_i').\n    modifier([_|Tail], Index):-\n        modifier(Tail, Index1),\n        atom_concat(Index1, 'i', Index).\n    negate(X, Arg) :-\n        functor(X, '-', _) -> (\n            arg(1, X, Arg));\n        functor(X, 'p', _) -> (\n            arg(1, X, PX),\n            (functor(PX, '-', _) -> (\n                arg(1, PX, PNX),\n                Arg = o(PNX)\n            );\n            Arg = o(-(PX))));\n        Arg = -(X).\n    prologEscape(X) :- \\+ functor(X, 'prolog', _), \\+ functor(X, '~', _).\n    /*\n     *   Standard rules (RuleName : Preconditions => Effects)\n     *   Special rules (RuleName : Effects)\n     */\n    convertAllRules([], []).\n    convertAllRules([[H,P,E]|T], [R|Rules]) :- convertRule(H, P, E, R), convertAllRules(T, Rules).\n    convertAllRules([[H,E]|T], [R|Rules]) :- convertRule(H, E, R), convertAllRules(T, Rules).\n    /*\n     *   Convert the given rule to the standard format\n     *   Example:\n     *   r2: followedGuidelines(X), doctor(X) => -liable(X)\n     *   rule([r2,[[followedGuidelines(X_e4149)],[doctor(X_e4149)]],[neg,liable(X_e4149)]]).\n     */\n    convertRule(RuleName, Preconditions, Effects, rule(List)) :-\n        tuple_to_list(Preconditions, Lprecond),\n        tuple_to_list(Effects, Leffects),\n        check_modifiers_in_list(preconditions, Lprecond, LprecondChecked),\n        check_modifiers_in_list(effects, Leffects, LeffectsChecked),\n        flatten_first_level(LeffectsChecked, LeffectsCheckedFlattened),\n        List = [RuleName, LprecondChecked, LeffectsCheckedFlattened].\n    /*\n     *   Convert the given special rule\n     *   Example:\n     *   bp(-liable(X)).\n     *   abastractBp([[neg, liable(X_e4149)]]).\n     */\n    convertRule(bps, Effects, abstractBp(Checked)) :-\n        functor(Effects, 'bp', _),\n        Effects =.. L,\n        removehead(L, LC),\n        check_modifiers_in_list(effects, LC, Checked).\n    convertRule(Name, Effects, premise([Name, LeffectsCheckedFlattened])) :-\n        tuple_to_list(Effects, Leffects),\n        check_modifiers_in_list(effects, Leffects, LeffectsChecked),\n        flatten_first_level(LeffectsChecked, LeffectsCheckedFlattened).\n    /*\n     *   Find negations(-), obligations(o), permissions(p) on a list of preconditions/effects and\n     *   raplace them with the assigned literal (neg, obl, perm)\n     */\n    check_modifiers_in_list(MODE, [], []).\n    check_modifiers_in_list(MODE, [H|T], L) :- H == [], L = [].\n    check_modifiers_in_list(MODE, [H|T], L) :- H \\== [],\n                                check_modifiers(H, LH),\n                                check_admissibility(MODE, H, LH),\n                                check_modifiers_in_list(MODE, T, LT),\n                                append([LH], LT, L).\n    check_admissibility(preconditions, H, LH) :-\n        \\+ defeasible_admissible(LH),\n        throw(['Premise  ', H, '  is not a well formed member of the argumentation language.']).\n    check_admissibility(effects, H, LH) :-\n        \\+ admissible(LH),\n        throw(['Conclusion  ', H, '  is not a well formed member of the argumentation language.']).\n    check_admissibility(_, _, _).\n    check_modifiers([], []).\n    check_modifiers(H, List) :-\n        functor(H, '-', _) -> (\n            arg(1, H, Arg),\n            check_modifiers(Arg, Lobl),\n            append([neg], Lobl, Lf),\n            List = Lf);\n        functor(H, 'o', _) -> (\n            arg(1, H, Arg),\n            check_modifiers(Arg, Lobl),\n            List = [obl|[Lobl]]);\n        functor(H, 'p', _) -> (\n            arg(1, H, Arg),\n            check_modifiers(Arg, Lper),\n            List = [perm|[Lper]]);\n        functor(H, '~', _) -> (\n            arg(1, H, Arg),\n            check_modifiers(Arg, Lper),\n            List = [unless|[Lper]]);\n        functor(H, 'bp', _) -> (\n            H =.. [_|Arg],\n            check_modifiers_in_list(effects, Arg, Lper),\n            List = [bp|[Lper]]);\n        List = [H].\n    /*\n     *   Convert the given tuple to list\n     */\n    tuple_to_list((A,B),L) :- tuple_to_list(A, La), tuple_to_list(B, Lb), append(La, Lb,L).\n    tuple_to_list(A,[A]) :- nonvar(A), A \\= (_ , _).\n    list_to_tuple([H], (H)).\n    list_to_tuple([H|T], (H,TT)) :- list_to_tuple(T,TT).\n    /*\n     *   Replace all the occurences of a given element with the given argument\n     */\n    replace(_, _, [],[]).\n    replace(O, R, [O|T], [R|T2]) :- replace(O, R, T, T2).\n    replace(O, R, [H|T], [H|T2]) :- H \\= O, replace(O, R, T, T2).\n    flatten_first_level([X], X).\n    flatten_first_level.\n    removehead([_|Tail], Tail).\n    in(A, A) :- nonvar(A), A \\= (_ , _).\n    in(A, (A, _)).\n    in(A, (_ , Cs)) :- in(A, Cs).\n    defeasible_admissible([unless, Term]) :- admissible(Term).\n    defeasible_admissible(Term) :- admissible(Term).\n    admissible([neg, bp, Term]) :- admissible_terms_complete(Term).\n    admissible([bp, Term]) :- admissible_terms_complete(Term).\n    admissible([neg, Term]) :- admissible_term(Term).\n    admissible([obl, [Term]]) :- admissible_term(Term).\n    admissible([obl, [neg, Term]]) :- admissible_term(Term).\n    admissible([neg, obl, [Term]]) :- admissible_term(Term).\n    admissible([neg, obl, [neg, Term]]) :- admissible_term(Term).\n    admissible([perm, [Term]]) :- admissible_term(Term).\n    admissible([perm, [neg, Term]]) :- admissible_term(Term).\n    admissible([Term]) :- admissible_term(Term).\n    admissible_term(Term) :-\n        atomic(Term),\n        Term \\== neg,\n        Term \\== obl,\n        Term \\== perm,\n        Term \\== unless,\n        Term \\== bp.\n    admissible_term(Term) :- var(Term).\n    admissible_term(Term) :-\n        compound(Term),\n        \\+ functor(Term, 'o', _),\n        \\+ functor(Term, 'p', _),\n        \\+ functor(Term, '-', _),\n        \\+ functor(Term, '~', _),\n        \\+ functor(Term, 'bp', _),\n        Term =.. [_|Args],\n        admissible_terms(Args).\n    admissible_terms([]).\n    admissible_terms([H|T]) :-\n        admissible_term(H),\n        admissible_terms(T).\n    admissible_terms_complete([]).\n    admissible_terms_complete([H|T]) :-\n        admissible(H),\n        admissible_terms_complete(T).\n        ");
  }
  RuleTranslator.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'RuleTranslator',
    interfaces: []
  };
  var RuleTranslator_instance = null;
  function RuleTranslator_getInstance() {
    if (RuleTranslator_instance === null) {
      new RuleTranslator();
    }return RuleTranslator_instance;
  }
  function StatementLabelling() {
    StatementLabelling_instance = this;
    this.theoryCode = trimIndent('\n    statementLabelling :-\n        findall(_, (\n            context_check(in([_, _, Conc, _, _])),\n            \\+ context_check(statIn(Conc)),\n            context_assert(statIn(Conc))\n        ), _),\n        findall(_, (\n            context_check(out([_, _, Conc, _, _])),\n            \\+ context_check(statIn(Conc)),\n            \\+ context_check(statOut(Conc)),\n            context_assert(statOut(Conc))\n        ), _),\n        findall(_, (\n            context_check(und([_, _, Conc, _, _])),\n            \\+ context_check(statIn(Conc)),\n            \\+ context_check(statOut(Conc)),\n            \\+ context_check(statUnd(Conc)),\n            context_assert(statUnd(Conc))\n        ), _).\n        ');
  }
  StatementLabelling.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'StatementLabelling',
    interfaces: []
  };
  var StatementLabelling_instance = null;
  function StatementLabelling_getInstance() {
    if (StatementLabelling_instance === null) {
      new StatementLabelling();
    }return StatementLabelling_instance;
  }
  function SuperiorityRelation() {
    SuperiorityRelation_instance = this;
    this.theoryCode = trimIndent('\n    superiorArgument(A, B) :- superiorArgumentSupportBuffered(A, B, _).\n    superiorArgument(A, B, SupSet) :- superiorArgumentSupportBuffered(A, B, SupSet).\n    superiorArgumentSupportBuffered(A, B, SupSet) :-\n        context_check(superior(A, B, SupSet, true)), !.\n    superiorArgumentSupportBuffered(A, B, SupSet) :-\n        context_check(superior(A, B, SupSet, false)),\n        fail, !.\n    superiorArgumentSupportBuffered(A, B, SupSet) :-\n        \\+ context_check(superior(A, B, _, _)),\n        superiorArgumentSupport(A, B, SupSet),\n        context_assert(superior(A, B, SupSet, true)), !.\n    superiorArgumentSupportBuffered(A, B, SupSet) :-\n        \\+ cache_check(superior(A, B, _, _)),\n        context_assert(superior(A, B, [], false)),\n        fail, !.\n    superiorArgumentSupport([_, _, _, _, [LastDefRulesA, DefRulesA, DefPremisesA]], [_, _, _, _, [LastDefRulesB, DefRulesB, DefPremisesB]], SupSet) :-\n    \tsuperiorArgumentSupport(LastDefRulesA, DefRulesA, DefPremisesA, LastDefRulesB, DefRulesB, DefPremisesB, SupSet).\n    superiorArgumentSupport(LastDefRulesA, _, DefPremisesA, LastDefRulesB, _, DefPremisesB, SupSet) :-\n        orderingPrinciple(last),\n    \tsuperior(LastDefRulesA, DefPremisesA, LastDefRulesB, DefPremisesB, SupSet).\n    superiorArgumentSupport(_, DefRulesA, DefPremisesA, _, DefRulesB, DefPremisesB, SupSet) :-\n        orderingPrinciple(weakest),\n    \tsuperior(DefRulesA, DefPremisesA, DefRulesB, DefPremisesB, SupSet).\n    superior([], PremisesA, [], PremisesB, SupSet) :-\n    \tweaker(PremisesB, PremisesA, SupSet).\n    superior(DefRulesA, _, DefRulesB, _, SupSet) :-\n    \torderingPrinciple(last),\n    \t(DefRulesA \\== []; DefRulesB \\== []),\n    \tweaker(DefRulesB, DefRulesA, SupSet).\n    superior(DefRulesA, [], DefRulesB, [], SupSet) :-\n    \torderingPrinciple(weakest),\n    \tweaker(DefRulesB, DefRulesA, SupSet).\n    superior(DefRulesA, PremisesA, DefRulesB, PremisesB, SupSet) :-\n    \torderingPrinciple(weakest),\n    \t(DefRulesA \\== []; DefRulesB \\== []),\n    \t(PremisesA \\== []; PremisesB \\== []),\n    \tweaker(DefRulesB, DefRulesA, SupSetA),\n    \tweaker(PremisesB, PremisesA, SupSetB),\n    \tutils::appendLists([SupSetA, SupSetB], SupSet).\n    weaker(RulesA, [], []) :-\n    \tRulesA \\== [].\n    weaker(RulesA, RulesB, SupSet) :-\n    \tRulesA \\== [],\n    \tRulesB \\== [],\n    \torderingComparator(elitist),\n    \tmember(Rule, RulesA),\n    \tallStronger(Rule, RulesB, SupSet), !.\n    weaker(RulesA, RulesB, SupSet) :-\n    \tRulesA \\== [],\n    \tRulesB \\== [],\n    \torderingComparator(democrat),\n    \tweakerDemo(RulesA, RulesB, SupSet).\n    weaker(RulesA, RulesB, [sup(X, W)]) :-\n    \tRulesA \\== [],\n    \tRulesB \\== [],\n    \torderingComparator(normal),\n    \tmember(W, RulesA),\n    \tmember(X, RulesB),\n    \tcontext_check(sup(X, W)), !.\n    weakerDemo([], _, []).\n    weakerDemo([H|T], Rules, [Sup|SupSet]) :-\n    \tsingleStronger(H, Rules, Sup),\n    \tweakerDemo(T, Rules, SupSet).\n    singleStronger(Target, Rules, sup(Rule, Target)) :-\n    \tmember(Rule, Rules),\n    \tcontext_check(sup(Rule, Target)), !.\n    allStronger(_, [], []).\n    allStronger(Target, [Rule|Rules], [sup(Rule, Target)|SupSet]) :-\n    \tcontext_check(sup(Rule, Target)),\n    \tallStronger(Target, Rules, SupSet).\n        ');
  }
  SuperiorityRelation.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'SuperiorityRelation',
    interfaces: []
  };
  var SuperiorityRelation_instance = null;
  function SuperiorityRelation_getInstance() {
    if (SuperiorityRelation_instance === null) {
      new SuperiorityRelation();
    }return SuperiorityRelation_instance;
  }
  function Utils() {
    Utils_instance = this;
    this.theoryCode = trimIndent('\n    writeList([]) :- nl.\n    writeList([X|Others]) :-\n    \twrite(X),\n    \twriteList(Others).\n    writeListNl([]).\n    writeListNl([X|Others]) :-\n    \twrite(X),nl,\n    \twriteListNl(Others).\n    sortDistinct(List, Sorted) :-\n        deduplicate(List, Deduplicated),\n        sort(Deduplicated, Sorted).\n    deduplicate([], []).\n    deduplicate(List, Output) :-\n        List \\== [],\n        setof(X, member(X, List), Output).\n    sort(List,Sorted) :- q_sort(List, [], Sorted).\n    q_sort([], Acc, Acc).\n    q_sort([H|T], Acc, Sorted) :-\n    \tpivoting(H, T, L1, L2),\n    \tq_sort(L1, Acc, Sorted1),\n    \tq_sort(L2, [H|Sorted1], Sorted).\n    pivoting(H,[],[],[]).\n    pivoting(H, [X|T], [X|L], G) :-\n        H @>= X,\n        pivoting(H, T, L, G).\n    pivoting(H, [X|T], L, [X|G]) :-\n        X @> H,\n        pivoting(H, T, L, G).\n    subtract([], _, []).\n    subtract([Head|Tail], L2, L3) :-\n            member(Head, L2), !,\n            subtract(Tail, L2, L3).\n    subtract([Head|Tail1], L2, [Head|Tail3]) :-\n            subtract(Tail1, L2, Tail3).\n    isEmptyList([]).\n    appendLists([], []).\n    appendLists([H|T], R) :-\n        appendLists(T, AT),\n        append(H, AT, R).\n    search(F, L, S) :-\n       between(1, L, N),\n       functor(S, F, N),\n       call(S).\n    between(N, M, K) :- N < M, K = N.\n    between(N, M, K) :- N == M, !, K = N.\n    between(N, M, K) :- N < M, N1 is N+1, between(N1, M, K).\n    recoverGraph(Args, Attacks, Supports) :-\n            findall(X, context_check(argument(X)), TempArgs),\n            findall((T, A, B, C), context_check(attack(T, A, B, C)), TempAttacks),\n            findall((A, B), context_check(support(A, B)), TempSupports),\n            utils::sort(TempArgs, Args),\n            utils::sort(TempAttacks, Attacks),\n            utils::sort(TempSupports, Supports).\n    recoverArgumentLabelling(ArgsIn, ArgsOut, ArgsUnd) :-\n            findall(X, context_check(in(X)), TempArgsIn),\n            findall(X, context_check(out(X)), TempArgsOut),\n            findall(X, context_check(und(X)), TempArgsUnd),\n            utils::sort(TempArgsIn, ArgsIn),\n            utils::sort(TempArgsOut, ArgsOut),\n            utils::sort(TempArgsUnd, ArgsUnd).\n    recoverStatementLabelling(In, Out, Und) :-\n            findall(X, context_check(statIn(X)), TempIn),\n            findall(X, context_check(statOut(X)), TempOut),\n            findall(X, context_check(statUnd(X)), TempUnd),\n            utils::sort(TempIn, In),\n            utils::sort(TempOut, Out),\n            utils::sort(TempUnd, Und).\n        ');
  }
  Utils.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Utils',
    interfaces: []
  };
  var Utils_instance = null;
  function Utils_getInstance() {
    if (Utils_instance === null) {
      new Utils();
    }return Utils_instance;
  }
  function StructuredMode() {
    StructuredMode_instance = this;
    StructuredModeBase.call(this);
  }
  Object.defineProperty(StructuredMode.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return QueryMode_getInstance_0().theoryCode;
    }
  });
  StructuredMode.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'StructuredMode',
    interfaces: [StructuredModeBase]
  };
  var StructuredMode_instance = null;
  function StructuredMode_getInstance() {
    if (StructuredMode_instance === null) {
      new StructuredMode();
    }return StructuredMode_instance;
  }
  function Debug_0() {
    Debug_instance_0 = this;
    DebugBase.call(this);
  }
  Object.defineProperty(Debug_0.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return Debug_getInstance().theoryCode;
    }
  });
  Debug_0.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Debug',
    interfaces: [DebugBase]
  };
  var Debug_instance_0 = null;
  function Debug_getInstance_0() {
    if (Debug_instance_0 === null) {
      new Debug_0();
    }return Debug_instance_0;
  }
  function SuperiorityRelation_0() {
    SuperiorityRelation_instance_0 = this;
    SuperiorityRelationBase.call(this);
  }
  Object.defineProperty(SuperiorityRelation_0.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return SuperiorityRelation_getInstance().theoryCode;
    }
  });
  SuperiorityRelation_0.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'SuperiorityRelation',
    interfaces: [SuperiorityRelationBase]
  };
  var SuperiorityRelation_instance_0 = null;
  function SuperiorityRelation_getInstance_0() {
    if (SuperiorityRelation_instance_0 === null) {
      new SuperiorityRelation_0();
    }return SuperiorityRelation_instance_0;
  }
  function Utils_0() {
    Utils_instance_0 = this;
    UtilsBase.call(this);
  }
  Object.defineProperty(Utils_0.prototype, 'prologRawTheory', {
    configurable: true,
    get: function () {
      return Utils_getInstance().theoryCode;
    }
  });
  Utils_0.$metadata$ = {
    kind: Kind_OBJECT,
    simpleName: 'Utils',
    interfaces: [UtilsBase]
  };
  var Utils_instance_0 = null;
  function Utils_getInstance_0() {
    if (Utils_instance_0 === null) {
      new Utils_0();
    }return Utils_instance_0;
  }
  Object.defineProperty(Arg2pSolver, 'Companion', {
    get: Arg2pSolver$Companion_getInstance
  });
  var package$it = _.it || (_.it = {});
  var package$unibo = package$it.unibo || (package$it.unibo = {});
  var package$tuprolog = package$unibo.tuprolog || (package$unibo.tuprolog = {});
  var package$argumentation = package$tuprolog.argumentation || (package$tuprolog.argumentation = {});
  var package$core = package$argumentation.core || (package$argumentation.core = {});
  package$core.Arg2pSolver = Arg2pSolver;
  package$core.arg2p = arg2p;
  var package$dsl = package$core.dsl || (package$core.dsl = {});
  package$dsl.PrologWithArgumentation = PrologWithArgumentation;
  package$dsl.PrologWithArgumentationImpl = PrologWithArgumentationImpl;
  package$dsl.arg2pScope_c8pr0v$ = arg2pScope;
  var package$libs = package$core.libs || (package$core.libs = {});
  package$libs.ArgLibrary = ArgLibrary;
  package$libs.BaseArgLibrary = BaseArgLibrary;
  package$libs.UnionArgLibrary = UnionArgLibrary;
  package$libs.RawPrologContent = RawPrologContent;
  package$libs.LazyRawPrologContent = LazyRawPrologContent;
  package$libs.Loadable = Loadable;
  package$libs.ArgsFlag = ArgsFlag;
  package$libs.PrimitiveWithSignature = PrimitiveWithSignature;
  Cache.CacheAssert = Cache$CacheAssert;
  Cache.CacheRetract = Cache$CacheRetract;
  Cache.CacheGet = Cache$CacheGet;
  var package$basic = package$libs.basic || (package$libs.basic = {});
  package$basic.Cache = Cache;
  Context.DynamicCacheReset = Context$DynamicCacheReset;
  Context.DynamicCacheSelected = Context$DynamicCacheSelected;
  Context.DynamicCacheCheckout = Context$DynamicCacheCheckout;
  Context.DynamicCacheBranch = Context$DynamicCacheBranch;
  Context.DynamicCacheAssert = Context$DynamicCacheAssert;
  Context.DynamicCacheRetract = Context$DynamicCacheRetract;
  Context.DynamicCacheGet = Context$DynamicCacheGet;
  Context.DynamicCacheGetIndexed = Context$DynamicCacheGetIndexed;
  package$basic.Context = Context;
  DynamicLoader.AbstractWithLib = DynamicLoader$AbstractWithLib;
  DynamicLoader.WithLib = DynamicLoader$WithLib;
  DynamicLoader.WithLibInNewContext = DynamicLoader$WithLibInNewContext;
  package$basic.DynamicLoader = DynamicLoader;
  package$basic.EngineInterfaceBase = EngineInterfaceBase;
  Object.defineProperty(FlagsBuilder, 'Companion', {
    get: FlagsBuilder$Companion_getInstance
  });
  package$basic.FlagsBuilder = FlagsBuilder;
  var package$extra = package$libs.extra || (package$libs.extra = {});
  Object.defineProperty(package$extra, 'MetaInterpreter', {
    get: MetaInterpreter_getInstance
  });
  Object.defineProperty(package$extra, 'ModuleCalls', {
    get: ModuleCalls_getInstance
  });
  Object.defineProperty(package$extra, 'ModulesPath', {
    get: ModulesPath_getInstance
  });
  Object.defineProperty(package$extra, 'ModuleCall', {
    get: ModuleCall_getInstance
  });
  var package$graph = package$libs.graph || (package$libs.graph = {});
  package$graph.AbstractModeBase = AbstractModeBase;
  Object.defineProperty(package$graph, 'GraphExtension', {
    get: GraphExtension_getInstance
  });
  Object.defineProperty(package$graph, 'ArgumentLabellingMode', {
    get: ArgumentLabellingMode_getInstance
  });
  Object.defineProperty(package$graph, 'StatementLabellingMode', {
    get: StatementLabellingMode_getInstance
  });
  Object.defineProperty(package$graph, 'GraphBuildMode', {
    get: GraphBuildMode_getInstance
  });
  var package$builder = package$graph.builder || (package$graph.builder = {});
  package$builder.ArgumentationGraphBuilderBase = ArgumentationGraphBuilderBase;
  var package$extension = package$graph.extension || (package$graph.extension = {});
  package$extension.AttackRestrictionHandlerBase = AttackRestrictionHandlerBase;
  package$extension.BpMetaGraphHandlerBase = BpMetaGraphHandlerBase;
  package$extension.DefeasiblePreferencesHandlerBase = DefeasiblePreferencesHandlerBase;
  package$extension.GenericDefeasiblePreferencesHandlerBase = GenericDefeasiblePreferencesHandlerBase;
  package$extension.StrictPreferencesHandlerBase = StrictPreferencesHandlerBase;
  var package$labelling = package$graph.labelling || (package$graph.labelling = {});
  package$labelling.BpCompleteLabellerBase = BpCompleteLabellerBase;
  package$labelling.BpLabellerBase = BpLabellerBase;
  package$labelling.BpPartialLabellerBase = BpPartialLabellerBase;
  package$labelling.CompleteLabellerBase = CompleteLabellerBase;
  package$labelling.GroundedLabellerBase = GroundedLabellerBase;
  package$labelling.StatementLabellerBase = StatementLabellerBase;
  var package$language = package$libs.language || (package$libs.language = {});
  package$language.RuleParserBase = RuleParserBase;
  Object.defineProperty(package$language, 'AutoTransposition', {
    get: AutoTransposition_getInstance
  });
  Object.defineProperty(package$language, 'PrologStrictCompatibility', {
    get: PrologStrictCompatibility_getInstance
  });
  Object.defineProperty(package$language, 'ConversionUtils', {
    get: ConversionUtils_getInstance
  });
  Object.defineProperty(package$language, 'StrictRules', {
    get: StrictRules_getInstance
  });
  Object.defineProperty(package$language, 'Axioms', {
    get: Axioms_getInstance
  });
  Object.defineProperty(package$language, 'Premises', {
    get: Premises_getInstance
  });
  Object.defineProperty(package$language, 'DefeasibleRules', {
    get: DefeasibleRules_getInstance
  });
  Object.defineProperty(package$language, 'Bps', {
    get: Bps_getInstance
  });
  var package$structured = package$libs.structured || (package$libs.structured = {});
  package$structured.StructuredModeBase = StructuredModeBase;
  Object.defineProperty(package$structured, 'QueryMode', {
    get: QueryMode_getInstance
  });
  var package$utils = package$libs.utils || (package$libs.utils = {});
  package$utils.DebugBase = DebugBase;
  package$utils.SuperiorityRelationBase = SuperiorityRelationBase;
  Object.defineProperty(package$utils, 'OrderingPrinciple', {
    get: OrderingPrinciple_getInstance
  });
  Object.defineProperty(package$utils, 'OrderingComparator', {
    get: OrderingComparator_getInstance
  });
  package$utils.UtilsBase = UtilsBase;
  var package$mining = package$core.mining || (package$core.mining = {});
  package$mining.mineGraph = graph;
  package$mining.mineArguments = arguments_0;
  package$mining.mineAttacks = attacks;
  package$mining.mineSupports = supports;
  package$mining.mineLabels = labels;
  Object.defineProperty(Argument, 'Companion', {
    get: Argument$Companion_getInstance
  });
  var package$model = package$core.model || (package$core.model = {});
  package$model.Argument = Argument;
  package$model.Attack = Attack;
  Object.defineProperty(Graph, 'Companion', {
    get: Graph$Companion_getInstance
  });
  package$model.Graph = Graph;
  package$model.LabelledArgument = LabelledArgument;
  package$model.ArgItem = ArgItem;
  package$model.Premise = Premise;
  package$model.Rule = Rule;
  package$model.Support = Support;
  Object.defineProperty(package$basic, 'EngineInterface', {
    get: EngineInterface_getInstance
  });
  Object.defineProperty(package$graph, 'AbstractMode', {
    get: AbstractMode_getInstance
  });
  Object.defineProperty(package$builder, 'ArgumentationGraphBuilder', {
    get: ArgumentationGraphBuilder_getInstance
  });
  Object.defineProperty(package$extension, 'AttackRestrictionHandler', {
    get: AttackRestrictionHandler_getInstance
  });
  Object.defineProperty(package$extension, 'BpMetaGraphHandler', {
    get: BpMetaGraphHandler_getInstance
  });
  Object.defineProperty(package$extension, 'DefeasiblePreferencesHandler', {
    get: DefeasiblePreferencesHandler_getInstance
  });
  Object.defineProperty(package$extension, 'GenericDefeasiblePreferencesHandler', {
    get: GenericDefeasiblePreferencesHandler_getInstance
  });
  Object.defineProperty(package$extension, 'StrictPreferencesHandler', {
    get: StrictPreferencesHandler_getInstance
  });
  Object.defineProperty(package$labelling, 'BpCompleteLabeller', {
    get: BpCompleteLabeller_getInstance
  });
  Object.defineProperty(package$labelling, 'BpLabeller', {
    get: BpLabeller_getInstance
  });
  Object.defineProperty(package$labelling, 'BpPartialLabeller', {
    get: BpPartialLabeller_getInstance
  });
  Object.defineProperty(package$labelling, 'CompleteLabeller', {
    get: CompleteLabeller_getInstance
  });
  Object.defineProperty(package$labelling, 'GroundedLabeller', {
    get: GroundedLabeller_getInstance
  });
  Object.defineProperty(package$labelling, 'StatementLabeller', {
    get: StatementLabeller_getInstance
  });
  Object.defineProperty(package$language, 'RuleParser', {
    get: RuleParser_getInstance
  });
  var package$sources = package$libs.sources || (package$libs.sources = {});
  Object.defineProperty(package$sources, 'AbstractMode', {
    get: AbstractMode_getInstance_0
  });
  Object.defineProperty(package$sources, 'ArgumentationEngineInterface', {
    get: ArgumentationEngineInterface_getInstance
  });
  Object.defineProperty(package$sources, 'ArgumentationGraph', {
    get: ArgumentationGraph_getInstance
  });
  Object.defineProperty(package$sources, 'AttackRestriction', {
    get: AttackRestriction_getInstance
  });
  Object.defineProperty(package$sources, 'Bp', {
    get: Bp_getInstance
  });
  Object.defineProperty(package$sources, 'BpGrounded', {
    get: BpGrounded_getInstance
  });
  Object.defineProperty(package$sources, 'BpGroundedComplete', {
    get: BpGroundedComplete_getInstance
  });
  Object.defineProperty(package$sources, 'BpGroundedPartial', {
    get: BpGroundedPartial_getInstance
  });
  Object.defineProperty(package$sources, 'BpPartialComplete', {
    get: BpPartialComplete_getInstance
  });
  Object.defineProperty(package$sources, 'Complete', {
    get: Complete_getInstance
  });
  Object.defineProperty(package$sources, 'Debug', {
    get: Debug_getInstance
  });
  Object.defineProperty(package$sources, 'DefPreferences', {
    get: DefPreferences_getInstance
  });
  Object.defineProperty(package$sources, 'GenericDefPreferences', {
    get: GenericDefPreferences_getInstance
  });
  Object.defineProperty(package$sources, 'Grounded', {
    get: Grounded_getInstance
  });
  Object.defineProperty(package$sources, 'Preferences', {
    get: Preferences_getInstance
  });
  Object.defineProperty(package$sources, 'QueryMode', {
    get: QueryMode_getInstance_0
  });
  Object.defineProperty(package$sources, 'RuleTranslator', {
    get: RuleTranslator_getInstance
  });
  Object.defineProperty(package$sources, 'StatementLabelling', {
    get: StatementLabelling_getInstance
  });
  Object.defineProperty(package$sources, 'SuperiorityRelation', {
    get: SuperiorityRelation_getInstance
  });
  Object.defineProperty(package$sources, 'Utils', {
    get: Utils_getInstance
  });
  Object.defineProperty(package$structured, 'StructuredMode', {
    get: StructuredMode_getInstance
  });
  Object.defineProperty(package$utils, 'Debug', {
    get: Debug_getInstance_0
  });
  Object.defineProperty(package$utils, 'SuperiorityRelation', {
    get: SuperiorityRelation_getInstance_0
  });
  Object.defineProperty(package$utils, 'Utils', {
    get: Utils_getInstance_0
  });
  Arg2pSolver$Companion$of$ObjectLiteral.prototype.to2pLibraries = Arg2pSolver.prototype.to2pLibraries;
  Arg2pSolver$Companion$of$ObjectLiteral.prototype.operators = Arg2pSolver.prototype.operators;
  PrologWithArgumentation.prototype.call1 = PrologScopeWithTheories.prototype.call1;
  Object.defineProperty(PrologWithArgumentation.prototype, 'A', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'A'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'B', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'B'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'C', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'C'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'D', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'D'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'E', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'E'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'F', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'F'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'G', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'G'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'H', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'H'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'I', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'I'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'J', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'J'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'K', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'K'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'L', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'L'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'M', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'M'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'N', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'N'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'O', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'O'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'P', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'P'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'Q', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'Q'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'R', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'R'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'S', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'S'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'T', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'T'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'U', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'U'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'V', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'V'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'W', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'W'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'X', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'X'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'Y', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'Y'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'Z', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'Z'));
  Object.defineProperty(PrologWithArgumentation.prototype, '_', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, '_'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'at_end_of_stream', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'at_end_of_stream'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'cut', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'cut'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'halt', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'halt'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'nl', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'nl'));
  Object.defineProperty(PrologWithArgumentation.prototype, 'repeat', Object.getOwnPropertyDescriptor(PrologScopeWithTheories.prototype, 'repeat'));
  PrologWithArgumentation.prototype.abolish1 = PrologScopeWithTheories.prototype.abolish1;
  PrologWithArgumentation.prototype.append3 = PrologScopeWithTheories.prototype.append3;
  PrologWithArgumentation.prototype.arg3 = PrologScopeWithTheories.prototype.arg3;
  PrologWithArgumentation.prototype.assert1 = PrologScopeWithTheories.prototype.assert1;
  PrologWithArgumentation.prototype.asserta1 = PrologScopeWithTheories.prototype.asserta1;
  PrologWithArgumentation.prototype.assertz1 = PrologScopeWithTheories.prototype.assertz1;
  PrologWithArgumentation.prototype.at_end_of_stream1 = PrologScopeWithTheories.prototype.at_end_of_stream1;
  PrologWithArgumentation.prototype.atom1 = PrologScopeWithTheories.prototype.atom1;
  PrologWithArgumentation.prototype.atom_chars2 = PrologScopeWithTheories.prototype.atom_chars2;
  PrologWithArgumentation.prototype.atom_codes2 = PrologScopeWithTheories.prototype.atom_codes2;
  PrologWithArgumentation.prototype.atom_concat3 = PrologScopeWithTheories.prototype.atom_concat3;
  PrologWithArgumentation.prototype.atom_length2 = PrologScopeWithTheories.prototype.atom_length2;
  PrologWithArgumentation.prototype.atomic1 = PrologScopeWithTheories.prototype.atomic1;
  PrologWithArgumentation.prototype.bagof3 = PrologScopeWithTheories.prototype.bagof3;
  PrologWithArgumentation.prototype.between3 = PrologScopeWithTheories.prototype.between3;
  PrologWithArgumentation.prototype.blockOf = PrologScopeWithTheories.prototype.blockOf;
  PrologWithArgumentation.prototype.callable1 = PrologScopeWithTheories.prototype.callable1;
  PrologWithArgumentation.prototype.catch3 = PrologScopeWithTheories.prototype.catch3;
  PrologWithArgumentation.prototype.char_code2 = PrologScopeWithTheories.prototype.char_code2;
  PrologWithArgumentation.prototype.clause_fzbqwd$ = PrologScopeWithTheories.prototype.clause_fzbqwd$;
  PrologWithArgumentation.prototype.clause2 = PrologScopeWithTheories.prototype.clause2;
  PrologWithArgumentation.prototype.compound1 = PrologScopeWithTheories.prototype.compound1;
  PrologWithArgumentation.prototype.consOfAny = PrologScopeWithTheories.prototype.consOfAny;
  PrologWithArgumentation.prototype.consult1 = PrologScopeWithTheories.prototype.consult1;
  PrologWithArgumentation.prototype.substitutionContains = PrologScopeWithTheories.prototype.substitutionContains;
  PrologWithArgumentation.prototype.copy_term2 = PrologScopeWithTheories.prototype.copy_term2;
  PrologWithArgumentation.prototype.current_flag2 = PrologScopeWithTheories.prototype.current_flag2;
  PrologWithArgumentation.prototype.current_op3 = PrologScopeWithTheories.prototype.current_op3;
  PrologWithArgumentation.prototype.current_prolog_flag2 = PrologScopeWithTheories.prototype.current_prolog_flag2;
  PrologWithArgumentation.prototype.directive = PrologScopeWithTheories.prototype.directive;
  PrologWithArgumentation.prototype.directiveOfAny = PrologScopeWithTheories.prototype.directiveOfAny;
  PrologWithArgumentation.prototype.dynamic1 = PrologScopeWithTheories.prototype.dynamic1;
  PrologWithArgumentation.prototype.fact = PrologScopeWithTheories.prototype.fact;
  PrologWithArgumentation.prototype.factOfAny = PrologScopeWithTheories.prototype.factOfAny;
  PrologWithArgumentation.prototype.findall3 = PrologScopeWithTheories.prototype.findall3;
  PrologWithArgumentation.prototype.float1 = PrologScopeWithTheories.prototype.float1;
  PrologWithArgumentation.prototype.functor3 = PrologScopeWithTheories.prototype.functor3;
  PrologWithArgumentation.prototype.substitutionGet = PrologScopeWithTheories.prototype.substitutionGet;
  PrologWithArgumentation.prototype.ground1 = PrologScopeWithTheories.prototype.ground1;
  PrologWithArgumentation.prototype.include1 = PrologScopeWithTheories.prototype.include1;
  PrologWithArgumentation.prototype.initialization1 = PrologScopeWithTheories.prototype.initialization1;
  PrologWithArgumentation.prototype.integer1 = PrologScopeWithTheories.prototype.integer1;
  PrologWithArgumentation.prototype.list$default = PrologScopeWithTheories.prototype.list$default;
  PrologWithArgumentation.prototype.listOfAny = PrologScopeWithTheories.prototype.listOfAny;
  PrologWithArgumentation.prototype.load1 = PrologScopeWithTheories.prototype.load1;
  PrologWithArgumentation.prototype.matchAny$default = PrologScopeWithTheories.prototype.matchAny$default;
  PrologWithArgumentation.prototype.match = PrologScopeWithTheories.prototype.match;
  PrologWithArgumentation.prototype.matchWithOccurCheck = PrologScopeWithTheories.prototype.matchWithOccurCheck;
  PrologWithArgumentation.prototype.member2 = PrologScopeWithTheories.prototype.member2;
  PrologWithArgumentation.prototype.merge = PrologScopeWithTheories.prototype.merge;
  PrologWithArgumentation.prototype.mguAny$default = PrologScopeWithTheories.prototype.mguAny$default;
  PrologWithArgumentation.prototype.mgu = PrologScopeWithTheories.prototype.mgu;
  PrologWithArgumentation.prototype.naf1 = PrologScopeWithTheories.prototype.naf1;
  PrologWithArgumentation.prototype.natural = PrologScopeWithTheories.prototype.natural;
  PrologWithArgumentation.prototype.nonvar1 = PrologScopeWithTheories.prototype.nonvar1;
  PrologWithArgumentation.prototype.not1 = PrologScopeWithTheories.prototype.not1;
  PrologWithArgumentation.prototype.number1 = PrologScopeWithTheories.prototype.number1;
  PrologWithArgumentation.prototype.number_chars2 = PrologScopeWithTheories.prototype.number_chars2;
  PrologWithArgumentation.prototype.number_codes2 = PrologScopeWithTheories.prototype.number_codes2;
  PrologWithArgumentation.prototype.op3 = PrologScopeWithTheories.prototype.op3;
  PrologWithArgumentation.prototype.retract1 = PrologScopeWithTheories.prototype.retract1;
  PrologWithArgumentation.prototype.retractall1 = PrologScopeWithTheories.prototype.retractall1;
  PrologWithArgumentation.prototype.rule = PrologScopeWithTheories.prototype.rule;
  PrologWithArgumentation.prototype.scope = PrologScopeWithTheories.prototype.scope;
  PrologWithArgumentation.prototype.set_flag2 = PrologScopeWithTheories.prototype.set_flag2;
  PrologWithArgumentation.prototype.set_prolog_flag2 = PrologScopeWithTheories.prototype.set_prolog_flag2;
  PrologWithArgumentation.prototype.setof3 = PrologScopeWithTheories.prototype.setof3;
  PrologWithArgumentation.prototype.solve1 = PrologScopeWithTheories.prototype.solve1;
  PrologWithArgumentation.prototype.static1 = PrologScopeWithTheories.prototype.static1;
  PrologWithArgumentation.prototype.structOfAny = PrologScopeWithTheories.prototype.structOfAny;
  PrologWithArgumentation.prototype.sub_atom5 = PrologScopeWithTheories.prototype.sub_atom5;
  PrologWithArgumentation.prototype.theory = PrologScopeWithTheories.prototype.theory;
  PrologWithArgumentation.prototype.theoryOf = PrologScopeWithTheories.prototype.theoryOf;
  PrologWithArgumentation.prototype.theoryOfIterable = PrologScopeWithTheories.prototype.theoryOfIterable;
  PrologWithArgumentation.prototype.theoryOfSequence = PrologScopeWithTheories.prototype.theoryOfSequence;
  PrologWithArgumentation.prototype.throw1 = PrologScopeWithTheories.prototype.throw1;
  PrologWithArgumentation.prototype.tupleOfAny = PrologScopeWithTheories.prototype.tupleOfAny;
  PrologWithArgumentation.prototype.unifyAny$default = PrologScopeWithTheories.prototype.unifyAny$default;
  PrologWithArgumentation.prototype.unify = PrologScopeWithTheories.prototype.unify;
  PrologWithArgumentation.prototype.unifyWithOccurCheck = PrologScopeWithTheories.prototype.unifyWithOccurCheck;
  PrologWithArgumentation.prototype.var1 = PrologScopeWithTheories.prototype.var1;
  PrologWithArgumentation.prototype.write1 = PrologScopeWithTheories.prototype.write1;
  PrologWithArgumentation.prototype.neq2 = PrologScopeWithTheories.prototype.neq2;
  PrologWithArgumentation.prototype.nid2 = PrologScopeWithTheories.prototype.nid2;
  PrologWithArgumentation.prototype.power = PrologScopeWithTheories.prototype.power;
  PrologWithArgumentation.prototype.eq2 = PrologScopeWithTheories.prototype.eq2;
  PrologWithArgumentation.prototype.arithNeq2 = PrologScopeWithTheories.prototype.arithNeq2;
  PrologWithArgumentation.prototype.id2 = PrologScopeWithTheories.prototype.id2;
  PrologWithArgumentation.prototype.arithEq2 = PrologScopeWithTheories.prototype.arithEq2;
  PrologWithArgumentation.prototype.pow = PrologScopeWithTheories.prototype.pow;
  PrologWithArgumentation.prototype.anyAnd = PrologScopeWithTheories.prototype.anyAnd;
  PrologWithArgumentation.prototype.substitutionContainsKey = PrologScopeWithTheories.prototype.substitutionContainsKey;
  PrologWithArgumentation.prototype.substitutionContainsValue = PrologScopeWithTheories.prototype.substitutionContainsValue;
  PrologWithArgumentation.prototype.anyDiv = PrologScopeWithTheories.prototype.anyDiv;
  PrologWithArgumentation.prototype.anyEqualsTo = PrologScopeWithTheories.prototype.anyEqualsTo;
  PrologWithArgumentation.prototype.anyGreaterThan = PrologScopeWithTheories.prototype.anyGreaterThan;
  PrologWithArgumentation.prototype.anyGreaterThanOrEqualsTo = PrologScopeWithTheories.prototype.anyGreaterThanOrEqualsTo;
  PrologWithArgumentation.prototype.anyIf = PrologScopeWithTheories.prototype.anyIf;
  PrologWithArgumentation.prototype.anyIfVararg = PrologScopeWithTheories.prototype.anyIfVararg;
  PrologWithArgumentation.prototype.anyImpliedBy = PrologScopeWithTheories.prototype.anyImpliedBy;
  PrologWithArgumentation.prototype.anyImpliedByVararg = PrologScopeWithTheories.prototype.anyImpliedByVararg;
  PrologWithArgumentation.prototype.anyIntDiv = PrologScopeWithTheories.prototype.anyIntDiv;
  PrologWithArgumentation.prototype.stringInvoke = PrologScopeWithTheories.prototype.stringInvoke;
  PrologWithArgumentation.prototype.anyIs = PrologScopeWithTheories.prototype.anyIs;
  PrologWithArgumentation.prototype.anyLowerThan = PrologScopeWithTheories.prototype.anyLowerThan;
  PrologWithArgumentation.prototype.anyLowerThanOrEqualsTo = PrologScopeWithTheories.prototype.anyLowerThanOrEqualsTo;
  PrologWithArgumentation.prototype.anyMatches = PrologScopeWithTheories.prototype.anyMatches;
  PrologWithArgumentation.prototype.anyMguWith = PrologScopeWithTheories.prototype.anyMguWith;
  PrologWithArgumentation.prototype.anyMinus = PrologScopeWithTheories.prototype.anyMinus;
  PrologWithArgumentation.prototype.anyNonGreaterThan = PrologScopeWithTheories.prototype.anyNonGreaterThan;
  PrologWithArgumentation.prototype.anyNonLowerThan = PrologScopeWithTheories.prototype.anyNonLowerThan;
  PrologWithArgumentation.prototype.anyNotEqualsTo = PrologScopeWithTheories.prototype.anyNotEqualsTo;
  PrologWithArgumentation.prototype.anyOr = PrologScopeWithTheories.prototype.anyOr;
  PrologWithArgumentation.prototype.anyPlus = PrologScopeWithTheories.prototype.anyPlus;
  PrologWithArgumentation.prototype.anyPow = PrologScopeWithTheories.prototype.anyPow;
  PrologWithArgumentation.prototype.anyRem = PrologScopeWithTheories.prototype.anyRem;
  PrologWithArgumentation.prototype.anySup = PrologScopeWithTheories.prototype.anySup;
  PrologWithArgumentation.prototype.anyThen = PrologScopeWithTheories.prototype.anyThen;
  PrologWithArgumentation.prototype.anyTimes = PrologScopeWithTheories.prototype.anyTimes;
  PrologWithArgumentation.prototype.varTo = PrologScopeWithTheories.prototype.varTo;
  PrologWithArgumentation.prototype.stringTo = PrologScopeWithTheories.prototype.stringTo;
  PrologWithArgumentation.prototype.anyUnifyWith = PrologScopeWithTheories.prototype.anyUnifyWith;
  PrologWithArgumentation.prototype.univ2 = PrologScopeWithTheories.prototype.univ2;
  PrologWithArgumentation.prototype.list = PrologScopeWithTheories.prototype.list;
  PrologWithArgumentation.prototype.listFrom = PrologScopeWithTheories.prototype.listFrom;
  PrologWithArgumentation.prototype.listFromIterable = PrologScopeWithTheories.prototype.listFromIterable;
  PrologWithArgumentation.prototype.listFromSequence = PrologScopeWithTheories.prototype.listFromSequence;
  PrologWithArgumentation.prototype.matchAny = PrologScopeWithTheories.prototype.matchAny;
  PrologWithArgumentation.prototype.mguAny = PrologScopeWithTheories.prototype.mguAny;
  PrologWithArgumentation.prototype.mguWithOccurCheck = PrologScopeWithTheories.prototype.mguWithOccurCheck;
  PrologWithArgumentation.prototype.unifyAny = PrologScopeWithTheories.prototype.unifyAny;
  PrologWithArgumentationImpl.prototype.call_k9kufj$ = PrologWithArgumentation.prototype.call_k9kufj$;
  PrologWithArgumentationImpl.prototype.matchAny$default = PrologWithArgumentation.prototype.matchAny$default;
  PrologWithArgumentationImpl.prototype.mguAny$default = PrologWithArgumentation.prototype.mguAny$default;
  PrologWithArgumentationImpl.prototype.theory = PrologWithArgumentation.prototype.theory;
  PrologWithArgumentationImpl.prototype.theoryOf = PrologWithArgumentation.prototype.theoryOf;
  PrologWithArgumentationImpl.prototype.theoryOfIterable = PrologWithArgumentation.prototype.theoryOfIterable;
  PrologWithArgumentationImpl.prototype.theoryOfSequence = PrologWithArgumentation.prototype.theoryOfSequence;
  PrologWithArgumentationImpl.prototype.unifyAny$default = PrologWithArgumentation.prototype.unifyAny$default;
  PrologWithArgumentationImpl.prototype.anyMatches = PrologWithArgumentation.prototype.anyMatches;
  PrologWithArgumentationImpl.prototype.anyMguWith = PrologWithArgumentation.prototype.anyMguWith;
  PrologWithArgumentationImpl.prototype.anyUnifyWith = PrologWithArgumentation.prototype.anyUnifyWith;
  PrologWithArgumentationImpl.prototype.list = PrologWithArgumentation.prototype.list;
  PrologWithArgumentationImpl.prototype.listFromSequence = PrologWithArgumentation.prototype.listFromSequence;
  PrologWithArgumentationImpl.prototype.listFrom = PrologWithArgumentation.prototype.listFrom;
  PrologWithArgumentationImpl.prototype.listFromIterable = PrologWithArgumentation.prototype.listFromIterable;
  PrologWithArgumentationImpl.prototype.matchAny = PrologWithArgumentation.prototype.matchAny;
  PrologWithArgumentationImpl.prototype.mguWithOccurCheck = PrologWithArgumentation.prototype.mguWithOccurCheck;
  PrologWithArgumentationImpl.prototype.mguAny = PrologWithArgumentation.prototype.mguAny;
  PrologWithArgumentationImpl.prototype.unifyAny = PrologWithArgumentation.prototype.unifyAny;
  BaseArgLibrary.prototype.flags = ArgLibrary.prototype.flags;
  BaseArgLibrary.prototype.content = ArgLibrary.prototype.content;
  EngineInterfaceBase.prototype.flags = ArgLibrary.prototype.flags;
  EngineInterfaceBase.prototype.content = ArgLibrary.prototype.content;
  AbstractModeBase.prototype.flags = ArgLibrary.prototype.flags;
  AbstractModeBase.prototype.content = ArgLibrary.prototype.content;
  ArgumentationGraphBuilderBase.prototype.flags = ArgLibrary.prototype.flags;
  ArgumentationGraphBuilderBase.prototype.content = ArgLibrary.prototype.content;
  AttackRestrictionHandlerBase.prototype.flags = ArgLibrary.prototype.flags;
  AttackRestrictionHandlerBase.prototype.content = ArgLibrary.prototype.content;
  BpMetaGraphHandlerBase.prototype.flags = ArgLibrary.prototype.flags;
  BpMetaGraphHandlerBase.prototype.content = ArgLibrary.prototype.content;
  DefeasiblePreferencesHandlerBase.prototype.flags = ArgLibrary.prototype.flags;
  DefeasiblePreferencesHandlerBase.prototype.content = ArgLibrary.prototype.content;
  GenericDefeasiblePreferencesHandlerBase.prototype.flags = ArgLibrary.prototype.flags;
  GenericDefeasiblePreferencesHandlerBase.prototype.content = ArgLibrary.prototype.content;
  StrictPreferencesHandlerBase.prototype.flags = ArgLibrary.prototype.flags;
  StrictPreferencesHandlerBase.prototype.content = ArgLibrary.prototype.content;
  BpCompleteLabellerBase.prototype.flags = ArgLibrary.prototype.flags;
  BpCompleteLabellerBase.prototype.content = ArgLibrary.prototype.content;
  BpLabellerBase.prototype.flags = ArgLibrary.prototype.flags;
  BpLabellerBase.prototype.content = ArgLibrary.prototype.content;
  BpPartialLabellerBase.prototype.flags = ArgLibrary.prototype.flags;
  BpPartialLabellerBase.prototype.content = ArgLibrary.prototype.content;
  CompleteLabellerBase.prototype.flags = ArgLibrary.prototype.flags;
  CompleteLabellerBase.prototype.content = ArgLibrary.prototype.content;
  GroundedLabellerBase.prototype.flags = ArgLibrary.prototype.flags;
  GroundedLabellerBase.prototype.content = ArgLibrary.prototype.content;
  StatementLabellerBase.prototype.flags = ArgLibrary.prototype.flags;
  StatementLabellerBase.prototype.content = ArgLibrary.prototype.content;
  RuleParserBase.prototype.flags = ArgLibrary.prototype.flags;
  RuleParserBase.prototype.content = ArgLibrary.prototype.content;
  StructuredModeBase.prototype.flags = ArgLibrary.prototype.flags;
  StructuredModeBase.prototype.content = ArgLibrary.prototype.content;
  DebugBase.prototype.flags = ArgLibrary.prototype.flags;
  DebugBase.prototype.content = ArgLibrary.prototype.content;
  SuperiorityRelationBase.prototype.flags = ArgLibrary.prototype.flags;
  SuperiorityRelationBase.prototype.content = ArgLibrary.prototype.content;
  UtilsBase.prototype.flags = ArgLibrary.prototype.flags;
  UtilsBase.prototype.content = ArgLibrary.prototype.content;
  Premise.prototype.toTerm = ArgItem.prototype.toTerm;
  Rule.prototype.toTerm = ArgItem.prototype.toTerm;
  Kotlin.defineModule('@tuprolog/arg2p-core', _);
  return _;
}));

//# sourceMappingURL=arg2p-core.js.map
