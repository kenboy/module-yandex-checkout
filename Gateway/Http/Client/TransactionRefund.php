<?php
/**
 * Copyright (c) 2021. All rights reserved.
 * See LICENSE.txt for license details.
 */
namespace Kenboy\YooKassa\Gateway\Http\Client;

/**
 * Transaction Refund
 */
class TransactionRefund extends AbstractTransaction
{
    /**
     * @param array $data
     * @return \YooKassa\Request\Refunds\CreateRefundResponse
     * @throws \YooKassa\Common\Exceptions\ApiException
     * @throws \YooKassa\Common\Exceptions\BadApiRequestException
     * @throws \YooKassa\Common\Exceptions\ForbiddenException
     * @throws \YooKassa\Common\Exceptions\InternalServerError
     * @throws \YooKassa\Common\Exceptions\NotFoundException
     * @throws \YooKassa\Common\Exceptions\ResponseProcessingException
     * @throws \YooKassa\Common\Exceptions\TooManyRequestsException
     * @throws \YooKassa\Common\Exceptions\UnauthorizedException
     */
    protected function process(array $data)
    {
        $storeId = $data['store_id'] ?? null;
        // sending store id and other additional keys are restricted by Yoo API
        unset($data['store_id']);

        return $this->adapterFactory->create($storeId)
            ->refund($data);
    }
}
