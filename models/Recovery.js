// ======================================
// models/Recovery.js
// Layboka AI
// Abandoned Cart Recovery Model
// ======================================

const mongoose =
require("mongoose");

const RecoverySchema =
new mongoose.Schema({

  // ====================================
  // CLIENT
  // ====================================

  clientId:{

    type:
      mongoose.Schema.Types.ObjectId,

    ref:"Client",

    required:true,

    index:true

  },

  // ====================================
  // CUSTOMER
  // ====================================

  name:{
    type:String,
    default:""
  },

  email:{
    type:String,
    default:"",
    index:true
  },

  phone:{
    type:String,
    default:""
  },

  // ====================================
  // CART
  // ====================================

  cartId:{

    type:String,

    required:true,

    index:true

  },

  cart:[{

    productId:String,

    title:String,

    image:String,

    quantity:{
      type:Number,
      default:1
    },

    price:{
      type:Number,
      default:0
    }

  }],

  cartValue:{

    type:Number,

    default:0

  },

  // ====================================
  // STATUS
  // ====================================

  recovered:{

    type:Boolean,

    default:false,

    index:true

  },

  recoveredAt:Date,

  // ====================================
  // FIRST REMINDER
  // ====================================

  reminderSent:{

    type:Boolean,

    default:false,

    index:true

  },

  reminderSentAt:Date,

  // ====================================
  // SECOND REMINDER
  // ====================================

  secondReminderSent:{

    type:Boolean,

    default:false,

    index:true

  },

  secondReminderSentAt:Date,

  // ====================================
  // THIRD REMINDER
  // ====================================

  thirdReminderSent:{

    type:Boolean,

    default:false,

    index:true

  },

  thirdReminderSentAt:Date,

  // ====================================
  // CHANNELS
  // ====================================

  emailSentCount:{

    type:Number,

    default:0

  },

  whatsappSentCount:{

    type:Number,

    default:0

  },

  // ====================================
  // METADATA
  // ====================================

  country:{

    type:String,

    default:"US"

  },

  currency:{

    type:String,

    default:"USD"

  },

  notes:String

},

{

  timestamps:true

});

// ======================================
// INDEXES
// ======================================

RecoverySchema.index({

  recovered:1,

  reminderSent:1,

  createdAt:1

});

RecoverySchema.index({

  recovered:1,

  secondReminderSent:1,

  reminderSentAt:1

});

RecoverySchema.index({

  recovered:1,

  thirdReminderSent:1,

  secondReminderSentAt:1

});

// ======================================
// EXPORT
// ======================================

module.exports =
mongoose.model(
  "Recovery",
  RecoverySchema
);
