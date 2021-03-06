<?php
/**
 * Copyright (c) 2021. All rights reserved.
 * See LICENSE.txt for license details.
 */
namespace Kenboy\YooKassa\Block;

use Magento\Framework\Phrase;
use Magento\Payment\Block\ConfigurableInfo;

/**
 * Info Block
 */
class Info extends ConfigurableInfo
{
    /**
     * Returns label
     *
     * @param string $field
     * @return Phrase
     */
    protected function getLabel($field)
    {
        return __($field);
    }
}
