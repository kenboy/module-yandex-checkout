/**
 * Copyright (c) 2021. All rights reserved.
 * See LICENSE.txt for license details.
 */
/*browser:true*/
/*global define*/
define([
    'underscore',
    'jquery',
    'mage/translate',
    'Magento_Payment/js/view/payment/cc-form',
    'Magento_Checkout/js/model/quote',
    'Magento_Checkout/js/model/full-screen-loader',
    'Magento_Vault/js/view/payment/vault-enabler'
],
function (_, $, $t, Component, quote, fullScreenLoader, VaultEnabler) {
    'use strict';

    return Component.extend({
        defaults: {
            template: 'Kenboy_YooKassa/payment/form',
            active: false,
            paymentMethodToken: null,
            lastBillingAddress: null,
            ccCode: null,
            ccMessageContainer: null,
            code: 'yoomoney_cc',
            yoo: null,
            imports: {
                onActiveChange: 'active'
            }
        },

        /**
         * @returns {exports.initialize}
         */
        initialize: function () {
            this._super();
            this.vaultEnabler = new VaultEnabler();
            this.vaultEnabler.setPaymentCode(this.getVaultCode());

            return this;
        },

        /**
         * Set list of observable attributes
         *
         * @returns {exports.initObservable}
         */
        initObservable: function () {
            this._super()
                .observe(['active']);

            return this;
        },

        /**
         * Get payment name
         *
         * @returns {String}
         */
        getCode: function () {
            return this.code;
        },

        /**
         * Check if payment is active
         *
         * @returns {Boolean}
         */
        isActive: function () {
            var active = this.getCode() === this.isChecked();
            this.active(active);
            return active;
        },

        /**
         * Triggers when payment method change
         * @param {Boolean} isActive
         */
        onActiveChange: function (isActive) {
            var self = this;

            if (!isActive) {
                return;
            }

            this.restoreMessageContainer();
            this.restoreCode();

            fullScreenLoader.startLoader();
            require([this.getSdkUrl()], function () {
                self.yoo = window.YooMoneyCheckout(self.getShopId());
                fullScreenLoader.stopLoader();
            });
        },

        /**
         * Restore original message container for cc-form component
         */
        restoreMessageContainer: function () {
            this.messageContainer = this.ccMessageContainer;
        },

        /**
         * Restore original code for cc-form component
         */
        restoreCode: function () {
            this.code = this.ccCode;
        },

        /** @inheritdoc */
        initChildren: function () {
            this._super();
            this.ccMessageContainer = this.messageContainer;
            this.ccCode = this.code;

            return this;
        },

        /**
         * Get full selector name
         *
         * @param {String} field
         * @returns {String}
         */
        getSelector: function (field) {
            return '#' + this.getCode() + '_' + field;
        },

        /**
         * Get data
         *
         * @returns {Object}
         */
        getData: function () {
            var data = this._super();
            data['additional_data'] = _.extend(data['additional_data'], {
                'payment_method_token': this.paymentMethodToken
            });

            this.vaultEnabler.visitAdditionalData(data);

            return data;
        },

        /**
         * @returns {Boolean}
         */
        isVaultEnabled: function () {
            return this.vaultEnabler.isVaultEnabled();
        },

        /**
         * Set payment nonce
         * @param {String} paymentMethodToken
         */
        setPaymentMethodToken: function (paymentMethodToken) {
            this.paymentMethodToken = paymentMethodToken;
        },

        /**
         * Validate current credit card type
         * @returns {Boolean}
         */
        validateCardType: function () {
            return this.selectedCardType() !== null;
        },

        /**
         * Returns state of place order button
         * @returns {Boolean}
         */
        isButtonActive: function () {
            return this.isActive() && this.isPlaceOrderActionAllowed();
        },

        /**
         * Triggers order placing
         */
        placeOrderClick: function () {
            var self = this;

            if (this.validateCardType()) {
                this.isPlaceOrderActionAllowed(false);

                this.yoo.tokenize({
                    number: $(self.getSelector('cc_number')).val(),
                    cvc: $(self.getSelector('cc_cid')).val(),
                    month: ('0'+$(self.getSelector('expiration')).val()).substr(-2),
                    year: $(self.getSelector('expiration_yr')).val().substr(-2)
                })
                .then(function (response) {
                    if (response.status === 'success') {
                        self.setPaymentMethodToken(response.data.response.paymentToken);
                        self.placeOrder();
                    } else {
                        self.isPlaceOrderActionAllowed(true);

                        if (!_.isUndefined(response.error.message)) {
                            self.messageContainer.addErrorMessage({
                                message: response.error.message
                            });
                        }

                        for (var param in response.error.params) {
                            self.messageContainer.addErrorMessage({
                                message: response.error.params[param].message
                            });
                        }
                    }
                });
            }
        },

        /**
         * @returns {String}
         */
        getVaultCode: function () {
            return window.checkoutConfig.payment[this.getCode()].ccVaultCode;
        },

        /**
         * Get client token
         * @returns {String|*}
         */
        getShopId: function () {
            return window.checkoutConfig.payment[this.getCode()].shopId;
        },

        /**
         * Get sdk url
         * @returns {String|*}
         */
        getSdkUrl: function () {
            return window.checkoutConfig.payment[this.getCode()].sdkUrl;
        }
    });
});
